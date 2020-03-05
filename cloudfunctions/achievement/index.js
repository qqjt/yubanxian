// 成就百科爬虫，借助 puppeteer 进行页面渲染，cheerio 进行解析
// 云函数依赖云端安装、本地上传都失败了，只能本地运行
const cloud = require('wx-server-sdk');
// const fs = require('fs');
const assert = require('assert');
cloud.init();
const db = cloud.database();
const _ = db.command;

const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

const startUrl = 'https://www.jx3box.com/cj/#page=list&general=1&menu=1';
const prefix = 'https://www.jx3box.com';

// 云函数入口函数
exports.main = async (event, context) => {
  let menus = [];
  let subMenus = [];
  let details = [];

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(startUrl, {waitUntil: 'networkidle0'});
  const html = await page.content();
  await page.close();
  // 解析首页，获取一级分类
  const $ = cheerio.load(html, {decodeEntities: false});
  $('#m-cj-sidebar div .u-category').each(function (index, item) {
    menus.push({name: $(item).find('span.u-title').html(), uri: $(item).attr('href')});
  });
  console.log('menus', menus);
  // 解析一级分类页，获取二级分类（以及直属于一级的详情页）
  for (let i = 0; i < menus.length; ++i) {
    const page = await browser.newPage();
    await page.goto(prefix + menus[i].uri, {waitUntil: 'networkidle0'});
    const html = await page.content();
    await page.close();

    // 获取子分类
    const $ = cheerio.load(html, {decodeEntities: false});
    $('#m-cj-sidebar div .u-category.active').closest('div').find('ul.u-list li a').each(function (index, item) {
      subMenus.push({menuName: menus[i].name, name: $(item).html(), uri: $(item).attr('href')});
    });
    // 解析成就列表
    $('#m-cj-main ul.u-list li').find('h5.cj-head a').each(function (index, item) {
      details.push({menu: menus[i].name, subMenu: '', uri: $(item).attr('href')})
    });
  }
  console.log('subMenus', subMenus);
  // 解析二级分类页，获取详情页
  for (let i = 0; i < subMenus.length; ++i) {
    const page = await browser.newPage();
    await page.goto(prefix + subMenus[i].uri, {waitUntil: 'networkidle0'});
    const html = await page.content();
    await page.close();

    const $ = cheerio.load(html, {decodeEntities: false});
    $('#m-cj-main ul.u-list li').find('h5.cj-head a').each(function (index, item) {
      details.push({menu: subMenus[i].menuName, subMenu: subMenus[i].name, uri: $(item).attr('href')})
    });
  }
  console.log('details', details);
  // 解析详情页
  for (let i = 0; i < details.length; ++i) {
    const page = await browser.newPage();
    await page.goto(prefix + details[i].uri, {waitUntil: 'networkidle0'});
    const html = await page.content();

    const $ = cheerio.load(html, {decodeEntities: false});
    let achievement = details[i];
    let achievementSelector = $('#m-cj-main ul.u-list li.cj');
    achievement.name = achievementSelector.find('.cj-head a').html();
    achievement.points = achievementSelector.find('.cj-body .right .point').html();
    achievement.desc = achievementSelector.find('.cj-desc a').html();
    achievement.iconUrl = achievementSelector.find('.cj-body .left a img').attr('src');
    // 提取图标图片内容
    const iconContent = await getImageContent(page, achievement.iconUrl);
    const contentBuffer = Buffer.from(iconContent, 'base64');
    // fs.writeFileSync(iconFilename, contentBuffer, 'base64');
    const iconFilename = achievement.iconUrl.split('/').pop();
    const uploadResult = await cloud.uploadFile({
      cloudPath: 'icon/' + iconFilename,
      fileContent: contentBuffer,
    });
    if (uploadResult.fileID) {
      achievement.iconFileId = uploadResult.fileID;
    }
    console.log('achievement parsed', achievement);
    await page.close();
    await saveAchievement(achievement);
    // 成就数据入库
    await db.collection('achievements').add({
      data: achievement
    }).then((res) => {
      console.log(res);
    });
  }

  await browser.close();
  return true;
};

/**
 * 从 puppeteer 缓存中提取图片
 * @param page
 * @param url
 * @returns {Promise<*>}
 */
const getImageContent = async (page, url) => {
  const {content, base64Encoded} = await page._client.send(
    'Page.getResourceContent',
    {frameId: String(page.mainFrame()._id), url},
  );
  assert.equal(base64Encoded, true);
  return content;
};

/**
 * 保存信息到数据库
 * @param achievement
 * @returns {Promise<unknown>}
 */
const saveAchievement = (achievement) => {
  return new Promise((resolve, reject) => {
    db.collection('achievements').where({
      uri: _.eq(achievement.uri)
    }).get().then((res) => {
      if (res.data.length) { //已存在
        const existedData = res.data[0];
        db.collection('achievements').doc(existedData._id).update({
          data: achievement
        })
          .then(console.log('existed', achievement))
          .catch(console.error)
      } else {
        db.collection('achievements').add({
          data: achievement
        }).then((res) => {
          resolve(res)
        })
      }
    })
  });
};