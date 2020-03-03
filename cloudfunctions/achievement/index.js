// 云函数入口文件
const cloud = require('wx-server-sdk');

cloud.init();

const request = require('request');
const puppeteer =  require('puppeteer');
const cheerio = require('cheerio');

// 云函数入口函数
exports.main = async (event, context) => {
  const startUrl = 'https://www.jx3box.com/cj/#page=list&general=1&menu=1';
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(startUrl);
  // await page.screenshot({path: 'example.png'});
  // let bodyHTML = await page.evaluate(() => document.body.innerHTML);
  const html = await page.evaluate(() => document.body.innerHTML);
  console.log(html);
  // const $ = cheerio.load(html, {decodeEntities: false});
  // console.log($('#m-cj-sidebar').html());
  // $('#m-cj-sidebar div a').each(function (index, item) {
  //   console.log($(item).html());
  // });
  return true;

  // return new Promise((resolve, reject) => {
  //   request(startUrl,
  //     (err, res) => {
  //       if (err) {
  //         reject('net error');
  //       }
  //       const body = res.body;
  //       const $ = cheerio.load(body, {
  //         decodeEntities: false
  //       });
  //       $('#m-cj-sidebar div a').each(function (index, item) {
  //         console.log($(item).html());
  //       });
  //       resolve(true);
  //     })
  // });
};