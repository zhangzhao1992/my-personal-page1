const defaultContent = {
  tagline: "十五年匠心沉淀，用数字艺术赋能每一个硬核创意。",
  name: "无锡猫庐文化有限公司",
  headline: "深耕动漫与游戏动画制作15年，以顶尖的CG视听语言，为全球客户打造直击心灵的数字内容。",
  city: "中国 • 无锡",
  role: "项目负责人 / 创始人",
  founder: "陈宇",
  focus: "动漫动画制作 / 游戏动画定制 / 全流程项目交付",
  years: "15 年+",
  about:
    "无锡猫庐文化有限公司成立于2011年，是一家集高端动漫动画制作与次世代游戏动画内容开发于一体的创新型数字艺术企业。15年来，我们凭借严谨的项目管理体系与对前沿CG技术的敏锐洞察，主营业务涵盖全流程动漫影视制作、游戏高精度CG宣传片、角色技能与剧情动画等，成功助力海内外众多知名IP与现象级游戏实现视觉蜕变。",
  email: "chenyu@maoluculture.com",
  phone: "+86 182 6048 9983",
  website: "https://www.maoluanimation.com",
  experiences: [
    {
      period: "2011 - 至今",
      title: "次世代游戏动画内容定制",
      company: "无锡猫庐文化有限公司",
      description:
        "专注于为中大型游戏厂商提供全方位的动画解决方案。包含游戏开场CG、角色高精度动作设计、大招技能特效以及实时渲染剧情动画。精准匹配二次元、欧美写实、科幻、国风等多种美术风格，有效提升游戏产品的视觉张力与商业转化。",
    },
    {
      period: "2015 - 至今",
      title: "精品动漫影视与原创IP包装",
      company: "无锡猫庐文化有限公司",
      description:
        "提供从剧本分镜、角色概念设计、三维建模、骨骼绑定到特效后期的全流程动漫影视制作。参与过多部知名番剧与网络动画电影的制作，以院线级的画面质感与细腻的动画表演，赋予每一个故事真正的生命力。",
    },
  ],
};

const main = document.querySelector(".site-main");
const experienceList = document.querySelector("#experienceList");
const experienceTemplate = document.querySelector("#experienceTemplate");

function mergeContent(content = {}) {
  return {
    ...defaultContent,
    ...content,
    experiences: Array.isArray(content.experiences) ? content.experiences : defaultContent.experiences,
  };
}

async function loadContent() {
  try {
    const response = await fetch(`./profile.json?v=${Date.now()}`, { cache: "no-store" });

    if (response.ok) {
      return mergeContent(await response.json());
    }
  } catch {
    return defaultContent;
  }

  return defaultContent;
}

function setText(selector, value) {
  document.querySelectorAll(selector).forEach((element) => {
    element.textContent = value || "";
  });
}

function setLink(selector, value, prefix = "") {
  document.querySelectorAll(selector).forEach((element) => {
    element.textContent = value || "";
    element.href = value ? `${prefix}${value.replace(/\s/g, "")}` : "#contact";
  });
}

function renderExperience(experiences) {
  experienceList.innerHTML = "";

  experiences.forEach((experience) => {
    const item = experienceTemplate.content.firstElementChild.cloneNode(true);

    item.querySelectorAll("[data-exp-field]").forEach((field) => {
      field.textContent = experience[field.dataset.expField] || "";
    });

    experienceList.append(item);
  });
}

function renderContent(content) {
  document.querySelectorAll("[data-field]").forEach((field) => {
    const key = field.dataset.field;

    if (key !== "email" && key !== "phone" && key !== "website") {
      field.textContent = content[key] || "";
    }
  });

  setLink('[data-field="email"]', content.email, "mailto:");
  setLink('[data-field="phone"]', content.phone, "tel:");
  setLink('[data-field="website"]', content.website);
  renderExperience(content.experiences);
  main.hidden = false;
}

loadContent().then(renderContent);
