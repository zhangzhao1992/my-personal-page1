const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");

const root = __dirname;
const dataDir = process.env.DATA_DIR || path.join(root, "data");
const assetsDir = process.env.ASSETS_DIR || path.join(root, "assets");
const profilePath = path.join(dataDir, "profile.json");
const port = Number(process.env.PORT || 4174);
const host = process.env.HOST || "0.0.0.0";

const defaultProfile = {
  tagline: "专注于产品、技术与持续成长",
  name: "你的姓名",
  headline: "在这里写一句清晰、有力量的个人介绍，例如你的职业方向、擅长领域或正在寻找的机会。",
  city: "中国 · 城市",
  role: "你的职位",
  focus: "产品设计 / 前端开发 / 项目管理",
  years: "3 年+",
  about: "这里可以写你的个人简介。建议包含你的工作方式、关键能力、代表成果，以及你希望别人通过这个网站快速了解的重点。",
  email: "name@example.com",
  phone: "+86 000 0000 0000",
  website: "https://example.com",
  photoUrl: "",
  experiences: [
    {
      period: "2022 - 至今",
      title: "高级职位名称",
      company: "公司名称",
      description: "描述你在这段经历中的职责、关键项目、协作范围和可量化成果。",
    },
    {
      period: "2019 - 2022",
      title: "职位名称",
      company: "公司名称",
      description: "写下你负责过的业务、使用过的方法，以及这段经历带来的代表性成长。",
    },
  ],
};

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};

async function ensureStorage() {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.mkdir(assetsDir, { recursive: true });

  try {
    await fs.access(profilePath);
  } catch {
    await writeProfile(defaultProfile);
  }
}

async function readProfile() {
  await ensureStorage();
  const rawProfile = await fs.readFile(profilePath, "utf8");
  return { ...defaultProfile, ...JSON.parse(rawProfile) };
}

async function writeProfile(profile) {
  await fs.mkdir(dataDir, { recursive: true });
  const nextProfile = {
    ...defaultProfile,
    ...profile,
    experiences: Array.isArray(profile.experiences) ? profile.experiences : defaultProfile.experiences,
  };
  await fs.writeFile(profilePath, `${JSON.stringify(nextProfile, null, 2)}\n`, "utf8");
  return nextProfile;
}

function sendJson(response, status, value) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(value));
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;

      if (body.length > 16 * 1024 * 1024) {
        reject(new Error("请求内容过大"));
        request.destroy();
      }
    });

    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

async function savePhoto(dataUrl) {
  const match = dataUrl.match(/^data:(image\/(?:png|jpe?g|webp|gif));base64,(.+)$/);

  if (!match) {
    throw new Error("不支持的图片格式");
  }

  const extensionMap = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/webp": "webp",
    "image/gif": "gif",
  };
  const extension = extensionMap[match[1]];
  const photoPath = path.join(assetsDir, `profile-photo.${extension}`);

  await fs.mkdir(assetsDir, { recursive: true });
  await Promise.all(
    ["png", "jpg", "jpeg", "webp", "gif"].map((type) =>
      fs.rm(path.join(assetsDir, `profile-photo.${type}`), { force: true }),
    ),
  );
  await fs.writeFile(photoPath, Buffer.from(match[2], "base64"));

  const profile = await readProfile();
  return writeProfile({ ...profile, photoUrl: `/assets/profile-photo.${extension}` });
}

async function removePhoto() {
  await Promise.all(
    ["png", "jpg", "jpeg", "webp", "gif"].map((type) =>
      fs.rm(path.join(assetsDir, `profile-photo.${type}`), { force: true }),
    ),
  );

  const profile = await readProfile();
  return writeProfile({ ...profile, photoUrl: "" });
}

async function serveStatic(request, response) {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const pathname = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
  const staticRoot = pathname.startsWith("/assets/") ? assetsDir : root;
  const relativePath = pathname.startsWith("/assets/")
    ? pathname.replace(/^\/assets\//, "")
    : pathname;
  const filePath = path.normalize(path.join(staticRoot, relativePath));

  if (!filePath.startsWith(staticRoot)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  try {
    const file = await fs.readFile(filePath);
    response.writeHead(200, {
      "Content-Type": contentTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream",
      "Cache-Control": pathname.startsWith("/assets/") ? "no-cache" : "no-store",
    });
    response.end(file);
  } catch {
    response.writeHead(404);
    response.end("Not found");
  }
}

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host}`);

    if (url.pathname === "/api/profile" && request.method === "GET") {
      sendJson(response, 200, await readProfile());
      return;
    }

    if (url.pathname === "/api/profile" && request.method === "POST") {
      sendJson(response, 200, await writeProfile(JSON.parse(await readBody(request))));
      return;
    }

    if (url.pathname === "/api/photo" && request.method === "POST") {
      const body = JSON.parse(await readBody(request));
      sendJson(response, 200, await savePhoto(body.dataUrl || ""));
      return;
    }

    if (url.pathname === "/api/photo" && request.method === "DELETE") {
      sendJson(response, 200, await removePhoto());
      return;
    }

    await serveStatic(request, response);
  } catch (error) {
    sendJson(response, 500, { error: error.message || "服务器错误" });
  }
});

ensureStorage().then(() => {
  server.listen(port, host, () => {
    console.log(`Personal site running at http://${host}:${port}`);
  });
});
