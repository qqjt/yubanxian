// 成就百科爬虫，借助 puppeteer 进行页面渲染，cheerio 进行解析

const cloud = require('wx-server-sdk');
cloud.init();

const request = require('request');
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

const startUrl = 'https://www.jx3box.com/cj/#page=list&general=1&menu=1';
const prefix = 'https://www.jx3box.com';

async function getMenu(menuName, uri) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(prefix + uri, {waitUntil: 'networkidle0'});
  const html = await page.content();
  await browser.close();

  const $ = cheerio.load(html, {decodeEntities: false});
  // 获取子分类
  $('#m-cj-sidebar div .u-category.active').closest('div').find('ul.u-list li a').each(async function (index, item) {
    const subMenuName = $(item).html();
    const subMenuUrl = $(item).attr('href');
    console.log(subMenuName);
    await getSubMenu(menuName, subMenuName, subMenuUrl);
  });
  // 解析成就列表
  $('#m-cj-main ul.u-list li').find('h5.cj-head a').each(function (index, item) {
    console.log($(item).html());
    getDetail(menuName, null, $(item).attr('href'))
  })
}

async function getSubMenu(menuName, subMenuName, uri) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(prefix + uri, {waitUntil: 'networkidle0'});
  const html = await page.content();
  await browser.close();

  const $ = cheerio.load(html, {decodeEntities: false});

  $('#m-cj-main ul.u-list li').find('h5.cj-head a').each(function (index, item) {
    console.log($(item).html());
    getDetail(menuName, subMenuName, $(item).attr('href'))
  })
}

async function getDetail(menuName, subMenuName, uri) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(prefix + uri, {waitUntil: 'networkidle0'});
  const html = await page.content();
  await browser.close();

  const $ = cheerio.load(html, {decodeEntities: false});
  // TODO 解析详情页成就信息
}

// 云函数入口函数
exports.main = async (event, context) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(startUrl, {waitUntil: 'networkidle0'});
  const html = await page.content();
  await browser.close();

  const $ = cheerio.load(html, {decodeEntities: false});
  // console.log($('#m-cj-sidebar').html());
  $('#m-cj-sidebar div .u-category').each(async function (index, item) {
    const menuUri = $(item).attr('href');
    const menuName = $(item).find('span.u-title').html();
    console.log(menuName);
    await getMenu(menuName, menuUri);
  });
};