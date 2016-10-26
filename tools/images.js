const sharp = require("sharp"),
    console = require("./console"),
    file_type = require("file-type"),
    Q = require("q");

exports = module.exports.reduce = function (img) {
    console.log("file type images", file_type(img));
    return new Q.Promise((resolve, reject) => {
        sharp(img)
            .resize(require("nconf").get("config").photos_max_width)
            .embed()
            .withoutEnlargement()
            //.webp()
            .toBuffer((error, buffer) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(buffer);
                }
            });
    });
};
