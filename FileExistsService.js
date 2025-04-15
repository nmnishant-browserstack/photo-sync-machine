const fs = require("fs");
const path = require("path");

class FileExistsService {
  constructor(filePath = path.join(__dirname, "fileExistsMap.json")) {
    this.filePath = filePath;
    console.log(this.filePath);

    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify({}), "utf-8");
    }

    this.map = JSON.parse(fs.readFileSync(this.filePath, "utf-8"));
  }

  has(originalname) {
    return this.map[originalname];
  }

  add(originalname) {
    if (!this.map[originalname]) {
      this.map[originalname] = {
        savedAs: originalname,
        uploadedAt: new Date().toISOString(),
      };
      this.save();
    }
  }

  save() {
    fs.writeFileSync(this.filePath, JSON.stringify(this.map, null, 2), "utf-8");
  }
}

module.exports = FileExistsService;
