// 成就百科爬虫入口文件，借助 puppeteer 进行页面渲染，cheerio 进行解析

const cloud = require('wx-server-sdk');
cloud.init();

const request = require('request');
const puppeteer =  require('puppeteer');
const cheerio = require('cheerio');

const startUrl = 'https://www.jx3box.com/cj/#page=list&general=1&menu=1';

// 云函数入口函数
exports.main = async (event, context) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(startUrl, {waitUntil: 'networkidle0'});
  const html = await page.content();
  const $ = cheerio.load(html, {decodeEntities: false});
  // console.log($('#m-cj-sidebar').html());
  $('#m-cj-sidebar div .u-category').each(function (index, item) {
    const menuUrl = $(item).attr('href');
    const menuName = $(item).find('span.u-title').html();
    console.log(menuName);
    cloud.callFunction({
      name: 'getAchievementMenu',
      data: {
        menuUrl: menuUrl,
        menuName: menuName
      }
    });
  });
  return true;
};