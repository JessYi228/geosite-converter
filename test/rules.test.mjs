import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync, mkdirSync, readdirSync, chmodSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { Database, convert } from "../web/rules.js";

const root = fileURLToPath(new URL("../", import.meta.url));

test("formats, filtered recursive includes, affiliations and regex escaping", () => {
  const database = new Database({
    child: "Example.COM\nfull:ads.example.com @ADS &virtual\nfull:cn.example.com @cn\nkeyword:TRACKER\nregexp:^edge[0-9]{1,3}\\.example\\.com$ @cn\n",
    parent: "include:child @cn @-ads # comment\ninclude:virtual\n",
    virtual: "full:own.example.net\n"
  });
  const result = convert(database, ["child"], "custom");
  assert.match(result.surge, /DOMAIN-SUFFIX,example\.com\n/);
  assert.match(result.surge, /DOMAIN,ads\.example\.com\n/);
  assert.match(result.surge, /DOMAIN-KEYWORD,tracker\n/);
  assert.doesNotMatch(result.surge, /DOMAIN-REGEX/);
  const payload = result.mihomo.split("\n").filter(line => line.startsWith("  - ")).map(line => JSON.parse(line.slice(4)));
  assert.ok(payload.includes(String.raw`DOMAIN-REGEX,^edge[0-9]{1,3}\.example\.com$`));
  assert.equal(result.report.surge, 4);
  assert.equal(result.report.mihomo, 5);
  assert.equal(database.select("parent").length, 4);
  assert.equal(database.select("virtual").length, 2);
  assert.equal(database.select("geosite:CHILD@ADS").length, 1);
  assert.equal(database.select("child@-cn").length, 3);
});

test("attribute filtering precedes deduplication, including tagged subdomains", () => {
  const database = new Database({
    base: "example.com @cn\nexample.com @ads\nfull:sub.example.com @ads\n",
    parent: "include:base @ads @-cn\n"
  });
  assert.equal(database.select("parent").length, 2);
  const result = convert(database, ["base", "parent"]);
  assert.equal(result.surge.match(/DOMAIN-SUFFIX,example.com/g).length, 1);
  assert.match(convert(database, ["parent"]).surge, /DOMAIN,sub\.example\.com/);
});

test("affiliations create virtual lists, irrespective of input order", () => {
  for (const files of [
    { source: "example.com @cn &virtual", parent: "include:virtual @cn" },
    { parent: "include:virtual @cn", source: "example.com @cn &virtual" }
  ]) {
    const database = new Database(files);
    assert.deepEqual(database.select("virtual"), database.select("parent"));
  }
});

test("bang is a literal attribute, only @-attr negates", () => {
  const database = new Database({ base: "one.com @!cn\ntwo.com @cn\nthree.com" });
  assert.deepEqual(database.select("base@!cn").map(rule => rule.value), ["one.com"]);
  assert.deepEqual(database.select("base@-!cn").map(rule => rule.value), ["two.com", "three.com"]);
});

test("empty lists emit valid payload and multiple attributes use AND", () => {
  const database = new Database({ empty: "# comment", base: "one.com @cn @ads\ntwo.com @cn" });
  assert.match(convert(database, ["empty"]).mihomo, /payload: \[\]/);
  assert.equal(database.select("base@cn@ads").length, 1);
  assert.equal(convert(database, ["empty", "base"]).report.surge, 2);
});

test("missing includes and cycles fail", () => {
  assert.throws(() => new Database({ base: "include:missing" }).select("base"), /列表不存在/);
  assert.throws(() => new Database({ a: "include:b", b: "include:a" }).select("a"), /循环 include/);
});

test("invalid rules have a source location", () => {
  for (const line of ["full:", "full:bad..com", "-bad.com", "bad-.com", "bad_name.com", "unknown:example.com",
    "example.com @", "example.com @-cn", "example.com bad", "example.com &../evil",
    "include:base &other", "include:../evil", "include:base @-", "full:" + "a".repeat(64) + ".com",
    "constructor:example.com", "toString:example.com"]) {
    assert.throws(() => new Database({ base: line }), /base:1:/, line);
  }
  assert.throws(() => new Database({}), /不能为空/);
});

test("invalid selectors and unsafe output names fail", () => {
  const database = new Database({ base: "example.com" });
  for (const selector of ["../evil", "base@", "base@-", "base@../evil", "missing", "base@cn/foo"]) {
    assert.throws(() => database.select(selector), undefined, selector);
  }
  assert.throws(() => convert(database, ["base"], "../evil"));
  assert.throws(() => convert(database, []));
});

test("Go regexp syntax is preserved, not validated as JavaScript", () => {
  const database = new Database({ base: String.raw`regexp:(?i)^edge\.[a-z]{2,6}$` });
  assert.deepEqual(convert(database, ["base"]).report.surgeUnsupportedRegexp, [String.raw`(?i)^edge\.[a-z]{2,6}$`]);
});

test("merged output is deterministic across list and input ordering", () => {
  const first = new Database({ a: "b.com\na.com\na.com", b: "c.com" });
  const second = new Database({ b: "c.com", a: "a.com\nb.com" });
  assert.equal(convert(first, ["a", "b"]).surge, convert(second, ["b", "a"]).surge);
  assert.equal(convert(first, ["a", "b"]).mihomo, convert(second, ["b", "a"]).mihomo);
});

test("build publishes only AI, snapshot, hashes and static site; failed rebuild preserves output", () => {
  const temporary = mkdtempSync(join(tmpdir(), "geosite-test-"));
  try {
    const source = join(temporary, "data");
    const output = join(temporary, "dist");
    const config = join(temporary, "ai.config.json");
    mkdirSync(source);
    writeFileSync(join(source, "one"), "a.com\nfull:ads.a.com @ads");
    writeFileSync(join(source, "two"), "include:one @-ads\nb.com");
    writeFileSync(config, JSON.stringify({ name: "ai", lists: ["one", "two"], extraRules: ["full:extra.com"] }));
    const args = [join(root, "scripts/build.mjs"), "--source", source, "--output", output, "--config", config];
    execFileSync(process.execPath, args);
    const before = readFileSync(join(output, "manifest.json"), "utf8");
    const manifest = JSON.parse(before);
    assert.equal(manifest.ai.surge, 4);
    assert.deepEqual(readdirSync(join(output, "surge")), ["ai.list"]);
    assert.deepEqual(readdirSync(join(output, "mihomo")), ["ai.yaml"]);
    assert.ok(existsSync(join(output, "index.html")));
    assert.ok(existsSync(join(output, ".nojekyll")));
    for (const [path, hash] of Object.entries(manifest.sha256)) {
      assert.equal(createHash("sha256").update(readFileSync(join(output, path))).digest("hex"), hash);
    }
    const snapshot = JSON.parse(readFileSync(join(output, "source.json"), "utf8"));
    assert.equal(convert(new Database(snapshot.files), ["two"]).report.surge, 2);
    execFileSync(process.execPath, args);
    assert.equal(readFileSync(join(output, "manifest.json"), "utf8"), before);
    writeFileSync(config, JSON.stringify({ name: "ai", lists: ["missing"], extraRules: [] }));
    assert.notEqual(spawnSync(process.execPath, args).status, 0);
    assert.equal(readFileSync(join(output, "manifest.json"), "utf8"), before);
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
});

test("build refuses to replace an unmanaged directory", () => {
  const temporary = mkdtempSync(join(tmpdir(), "geosite-protect-"));
  try {
    const source = join(temporary, "data");
    const output = join(temporary, "important");
    const config = join(temporary, "config.json");
    mkdirSync(source);
    mkdirSync(output);
    writeFileSync(join(source, "base"), "a.com");
    writeFileSync(join(output, "keep.txt"), "keep me");
    writeFileSync(config, JSON.stringify({ name: "ai", lists: ["base"], extraRules: [] }));
    const result = spawnSync(process.execPath, [join(root, "scripts/build.mjs"), "--source", source, "--output", output, "--config", config], { encoding: "utf8" });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /拒绝覆盖/);
    assert.equal(readFileSync(join(output, "keep.txt"), "utf8"), "keep me");
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
});

test("first publication, repeat no-op and unchanged schedule checks use no network", { skip: process.platform === "win32" }, () => {
  const temporary = mkdtempSync(join(tmpdir(), "geosite-publish-"));
  const work = join(temporary, "work");
  const remote = join(temporary, "remote.git");
  const revision = "a".repeat(40);
  const git = (...args) => execFileSync("git", args, { cwd: work, encoding: "utf8", stdio: "pipe" }).trim();
  try {
    mkdirSync(work);
    git("init", "--bare", remote);
    git("init", "-b", "main");
    git("config", "user.name", "Test");
    git("config", "user.email", "test@example.com");
    writeFileSync(join(work, "README.md"), "source branch");
    writeFileSync(join(work, ".gitignore"), "dist/\n.upstream/\n");
    git("add", ".");
    git("commit", "-m", "initial");
    git("remote", "add", "origin", remote);
    git("push", "origin", "main");
    let published;
    for (let round = 0; round < 2; round++) {
      if (round) git("checkout", "main");
      const output = join(work, "dist");
      mkdirSync(join(output, "surge"), { recursive: true });
      mkdirSync(join(output, "mihomo"), { recursive: true });
      for (const name of ["index.html", "app.js", "rules.js", "style.css", "source.json", "LICENSE", "NOTICE", ".nojekyll", "surge/ai.list", "mihomo/ai.yaml"]) {
        writeFileSync(join(output, name), "fixture");
      }
      writeFileSync(join(output, "manifest.json"), JSON.stringify({ upstream: { revision }, projectRevision: "project-test" }));
      mkdirSync(join(work, ".upstream"), { recursive: true });
      writeFileSync(join(work, ".upstream/never-publish.txt"), "private checkout");
      execFileSync("bash", [join(root, "scripts/publish.sh")], {
        cwd: work, stdio: "pipe", env: { ...process.env, PUBLISH_DIR: join(temporary, `publish-${round}`) }
      });
      const paths = git("ls-tree", "-r", "--name-only", "HEAD").split("\n");
      assert.ok(paths.includes("surge/ai.list"));
      assert.ok(paths.includes("index.html"));
      assert.ok(!paths.some(path => path.startsWith(".upstream/")));
      if (!round) published = git("rev-parse", "HEAD");
      else assert.equal(git("rev-parse", "HEAD"), published, "identical output must not create another commit");
    }
    git("checkout", "main");
    const shim = join(temporary, "bin");
    mkdirSync(shim);
    const realGit = execFileSync("sh", ["-c", "command -v git"], { encoding: "utf8" }).trim();
    writeFileSync(join(shim, "git"), `#!/bin/sh\nif [ "$1" = ls-remote ] && [ "$2" = https://github.com/v2fly/domain-list-community.git ]; then\n  printf '${revision}\\trefs/heads/master\\n'\nelse\n  exec '${realGit}' "$@"\nfi\n`);
    chmodSync(join(shim, "git"), 0o755);
    for (const [event, project, expected] of [["schedule", "project-test", "false"], ["schedule", "new-project", "true"], ["workflow_dispatch", "project-test", "true"]]) {
      const output = join(temporary, "action-output");
      writeFileSync(output, "");
      execFileSync("bash", [join(root, "scripts/check-update.sh")], {
        cwd: work, stdio: "pipe", env: { ...process.env, PATH: `${shim}:${process.env.PATH}`, RUNNER_TEMP: temporary,
          EVENT_NAME: event, GITHUB_SHA: project, GITHUB_OUTPUT: output, GITHUB_STEP_SUMMARY: join(temporary, "summary") }
      });
      assert.match(readFileSync(output, "utf8"), new RegExp(`changed=${expected}`));
    }
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
});
