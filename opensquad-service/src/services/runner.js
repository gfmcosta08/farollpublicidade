import path from "path";
import { spawn } from "child_process";
import { existsSync, readdirSync, readFileSync } from "fs";

const getOpenSquadPath = () => {
  return process.env.PATH_OPENSQUAD || path.join(process.cwd(), "opensquad");
};

const getSquadsDir = () => path.join(getOpenSquadPath(), "squads");
const getSkillsDir = () => path.join(getOpenSquadPath(), "skills");

function listDirectories(dirPath) {
  if (!existsSync(dirPath)) return [];
  return readdirSync(dirPath, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}

export function listSquads() {
  const squadsDir = getSquadsDir();
  const squadNames = listDirectories(squadsDir);

  return squadNames.map((name) => {
    const configPath = path.join(squadsDir, name, "squad.json");
    let config = { description: "", agents: [], tasks: [] };

    if (existsSync(configPath)) {
      try {
        config = JSON.parse(readFileSync(configPath, "utf-8"));
      } catch (e) {}
    }

    return {
      name,
      description: config.description || "",
      agents: config.agents || [],
      tasks: config.tasks || [],
      hasDashboard: existsSync(path.join(squadsDir, name, "dashboard")),
      lastRun: config.lastRun || null,
    };
  }).sort((a, b) => a.name.localeCompare(b.name));
}

export function getSquadDetails(squadName) {
  const squadsDir = getSquadsDir();
  const configPath = path.join(squadsDir, squadName, "squad.json");

  if (!existsSync(configPath)) {
    throw new Error(`Squad not found: ${squadName}`);
  }

  const config = JSON.parse(readFileSync(configPath, "utf-8"));

  return {
    name: squadName,
    ...config,
    hasDashboard: existsSync(path.join(squadsDir, squadName, "dashboard")),
  };
}

export function runSquad(squadName, input = {}) {
  const opensquadPath = getOpenSquadPath();

  return new Promise((resolve, reject) => {
    if (!existsSync(opensquadPath)) {
      reject(new Error(`OpenSquad not found at: ${opensquadPath}`));
      return;
    }

    const packageJsonPath = path.join(opensquadPath, "package.json");
    if (!existsSync(packageJsonPath)) {
      reject(new Error("OpenSquad package.json not found"));
      return;
    }

    const logs = [];
    const maxDuration = 300000;

    const proc = spawn("node", ["bin/opensquad", "run", squadName], {
      cwd: opensquadPath,
      shell: true,
      env: { ...process.env },
    });

    const timeout = setTimeout(() => {
      proc.kill("SIGTERM");
      reject(new Error("Execution timed out (5 minutes)"));
    }, maxDuration);

    proc.stdout.on("data", (data) => {
      const msg = data.toString();
      logs.push({ type: "stdout", message: msg, timestamp: new Date().toISOString() });
    });

    proc.stderr.on("data", (data) => {
      const msg = data.toString();
      logs.push({ type: "stderr", message: msg, timestamp: new Date().toISOString() });
    });

    proc.on("close", (code) => {
      clearTimeout(timeout);
      resolve({
        success: code === 0,
        exitCode: code,
        logs,
        completedAt: new Date().toISOString(),
      });
    });

    proc.on("error", (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

export function listSkills() {
  const skillsDir = getSkillsDir();
  const skillNames = listDirectories(skillsDir);

  return skillNames.map((name) => {
    const manifestPath = path.join(skillsDir, name, "manifest.json");
    let manifest = {};

    if (existsSync(manifestPath)) {
      try {
        manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));
      } catch (e) {}
    }

    return {
      name,
      description: manifest.description || "",
      version: manifest.version || null,
    };
  });
}

export function getDashboardInfo(squadName) {
  const squadsDir = getSquadsDir();
  const dashboardPath = path.join(squadsDir, squadName, "dashboard");

  if (!existsSync(dashboardPath)) {
    return { exists: false, squadName };
  }

  return {
    exists: true,
    squadName,
    path: dashboardPath,
  };
}
