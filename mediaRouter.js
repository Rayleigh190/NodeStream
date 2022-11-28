const router = require("express").Router();
const multiparty = require("multiparty");
const url = require("url");
const fs = require("fs");

router.get("/audio/*", (req, res) => {
  const { pathname } = url.parse(req.url, true);
  const filepath = `./resource${pathname}`;

  const stat = fs.statSync(filepath);
  const fileSize = stat.size;
  const range = req.headers.range;
  // console.log("stat: " + stat);
  // console.log("fileSize: " + fileSize);
  console.log("range: " + range);

  if (!range) {
    // console.log("no");
    const header = { "Content-Type": "audio/mpeg" };
    res.writeHead(200, header);
    res.end();
  } else {
    // console.log("yes");
    const MAX_CHUNK_SIZE = 1000 * 1000;
    // ranage헤더 파싱
    const parts = range.replace(/bytes=/, "").split("-");
    // 재생 구간 설정
    const start = parseInt(parts[0], 10);
    const _end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const end = Math.min(_end, start + MAX_CHUNK_SIZE - 1);
    // console.log("end: " + end);
    const header = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Type": "audio/mpeg",
      "Content-Length": fileSize - 1,
    };
    res.writeHead(206, header);
    // console.log("res" + res);
    const readStream = fs.createReadStream(filepath, { start, end });
    // console.log("readStream" + readStream);
    readStream.pipe(res);
  }
});
router.get("/video/*", (req, res) => {
  const { pathname } = url.parse(req.url, true);
  const filepath = `./resource${pathname}`;

  const stat = fs.statSync(filepath);
  const fileSize = stat.size;
  const range = req.headers.range;
  // console.log("stat: " + stat);
  // console.log("fileSize: " + fileSize);
  console.log("range: " + range);

  if (!range) {
    // console.log("no");
    const header = { "Content-Type": "video/mp4" };
    res.writeHead(200, header);
    res.end();
  } else {
    // console.log("yes");
    const MAX_CHUNK_SIZE = 1000 * 1000 * 50;
    // ranage헤더 파싱
    const parts = range.replace(/bytes=/, "").split("-");
    // 재생 구간 설정
    const start = parseInt(parts[0], 10);
    const _end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const end = Math.min(_end, start + MAX_CHUNK_SIZE - 1);
    // console.log("end: " + end);
    const header = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Type": "video/mp4",
      "Content-Length": fileSize - 1,
    };
    res.writeHead(206, header);
    // console.log("res" + res);
    const readStream = fs.createReadStream(filepath, { start, end });
    // console.log("readStream" + readStream);
    readStream.pipe(res);
  }
});
router.post("/", (req, res) => {
  const form = new multiparty.Form();
  form.on("error", (err) => res.status(500).end());
  form.on("part", (part) => {
    // file이 아닌 경우 skip
    if (!part.filename) return part.resume();

    const filestream = fs.createWriteStream(`./resource/${part.filename}`);
    part.pipe(filestream);
  });
  form.on("close", () => res.end());
  form.parse(req);
});

module.exports = router;
