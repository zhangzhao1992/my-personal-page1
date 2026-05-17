const storageKey = "personal-site-content-v2";
const photoKey = "personal-site-photo-v2";

const defaultContent = {
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

const editableFields = document.querySelectorAll("[data-field]");
const editToggle = document.querySelector("#editToggle");
const editBar = document.querySelector("#editBar");
const saveButton = document.querySelector("#saveButton");
const exportButton = document.querySelector("#exportButton");
const resetButton = document.querySelector("#resetButton");
const photoInput = document.querySelector("#photoInput");
const portrait = document.querySelector("#portrait");
const portraitFrame = document.querySelector(".portrait-frame");
const photoHint = document.querySelector("#photoHint");
const addExperience = document.querySelector("#addExperience");
const experienceList = document.querySelector("#experienceList");
const experienceTemplate = document.querySelector("#experienceTemplate");

let content = structuredClone(defaultContent);
let isEditing = false;

function mergeContent(nextContent = {}) {
  return {
    ...structuredClone(defaultContent),
    ...nextContent,
    experiences: Array.isArray(nextContent.experiences)
      ? nextContent.experiences
      : structuredClone(defaultContent.experiences),
  };
}

async function loadContent() {
  const publishedContent = await loadPublishedProfile();

  if (publishedContent) {
    return publishedContent;
  }

  const localContent = localStorage.getItem(storageKey);

  if (!localContent) {
    return structuredClone(defaultContent);
  }

  try {
    return mergeContent(JSON.parse(localContent));
  } catch {
    return structuredClone(defaultContent);
  }
}

async function loadPublishedProfile() {
  const version = Date.now();
  const paths = [`./profile.json?v=${version}`, `./data/profile.json?v=${version}`];

  for (const path of paths) {
    try {
      const response = await fetch(path, { cache: "no-store" });

      if (response.ok) {
        return mergeContent(await response.json());
      }
    } catch {
      // Keep trying the next possible static profile location.
    }
  }

  return null;
}

function renderContent() {
  editableFields.forEach((field) => {
    field.textContent = content[field.dataset.field] || "";
  });

  renderExperiences();
  renderPhoto();
}

function renderExperiences() {
  experienceList.innerHTML = "";

  content.experiences.forEach((experience, index) => {
    const item = experienceTemplate.content.firstElementChild.cloneNode(true);

    item.dataset.index = String(index);
    item.querySelectorAll("[data-exp-field]").forEach((field) => {
      field.textContent = experience[field.dataset.expField] || "";
      field.contentEditable = String(isEditing);
    });

    item.querySelector(".delete-button").addEventListener("click", () => {
      content.experiences.splice(index, 1);
      renderExperiences();
      savePreviewContent();
    });

    experienceList.append(item);
  });
}

function renderPhoto() {
  const previewPhoto = localStorage.getItem(photoKey);
  const photo = content.photoUrl || previewPhoto;

  if (photo) {
    portrait.src = photo;
    portraitFrame.classList.add("has-photo");
    photoHint.textContent = "当前显示的是最新照片";
  } else {
    portrait.removeAttribute("src");
    portraitFrame.classList.remove("has-photo");
    photoHint.textContent = "上传一张照片后，这里会显示照片";
  }
}

function setEditing(nextValue) {
  isEditing = nextValue;
  document.body.classList.toggle("editing", isEditing);
  editToggle.textContent = isEditing ? "退出编辑" : "编辑内容";
  editBar.hidden = !isEditing;

  document.querySelectorAll(".editable").forEach((field) => {
    field.contentEditable = String(isEditing);
  });
}

function collectContent() {
  editableFields.forEach((field) => {
    content[field.dataset.field] = field.textContent.trim();
  });

  content.experiences = [...experienceList.querySelectorAll(".experience-item")].map((item) => {
    const experience = {};

    item.querySelectorAll("[data-exp-field]").forEach((field) => {
      experience[field.dataset.expField] = field.textContent.trim();
    });

    return experience;
  });
}

function savePreviewContent() {
  collectContent();
  localStorage.setItem(storageKey, JSON.stringify(content));
}

function exportPublicProfile() {
  collectContent();

  const previewPhoto = localStorage.getItem(photoKey);
  const publicContent = {
    ...content,
    photoUrl: content.photoUrl || previewPhoto || "",
  };
  const blob = new Blob([`${JSON.stringify(publicContent, null, 2)}\n`], {
    type: "application/json;charset=utf-8",
  });
  const link = document.createElement("a");

  link.href = URL.createObjectURL(blob);
  link.download = "profile.json";
  link.click();
  URL.revokeObjectURL(link.href);
}

function showStaticNotice() {
  alert("已保存到当前浏览器用于预览。要让公网网站更新，请点击“下载发布资料”，把下载的 profile.json 上传到 GitHub 根目录，然后在 Render 重新部署。");
}

function addNewExperience() {
  collectContent();
  content.experiences.push({
    period: "年份 - 年份",
    title: "新的职位",
    company: "公司名称",
    description: "在这里补充这段工作经历的主要职责和成果。",
  });
  renderExperiences();
  savePreviewContent();
}

function handlePhotoUpload(event) {
  const file = event.target.files?.[0];

  if (!file || !file.type.startsWith("image/")) {
    return;
  }

  const reader = new FileReader();

  reader.addEventListener("load", () => {
    localStorage.setItem(photoKey, String(reader.result));
    content.photoUrl = String(reader.result);
    renderPhoto();
    savePreviewContent();
  });

  reader.readAsDataURL(file);
}

function resetContent() {
  content = structuredClone(defaultContent);
  localStorage.removeItem(storageKey);
  localStorage.removeItem(photoKey);
  renderContent();
  setEditing(false);
}

editToggle.addEventListener("click", () => setEditing(!isEditing));

saveButton.addEventListener("click", () => {
  savePreviewContent();
  setEditing(false);
  showStaticNotice();
});

exportButton.addEventListener("click", exportPublicProfile);
resetButton.addEventListener("click", resetContent);
photoInput.addEventListener("change", handlePhotoUpload);
addExperience.addEventListener("click", addNewExperience);

loadContent().then((loadedContent) => {
  content = loadedContent;
  renderContent();
});
