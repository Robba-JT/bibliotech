const console = require("./console"),
      sharp = require("sharp");

exports = module.exports.reduce = function (photo) {
    return new Promise((resolve) => {
        sharp(photo)
            .resize(require("nconf").get("config").photos_max_width)
            .embed()
            .withoutEnlargement()
            //.webp()
            .toBuffer((error, buffer) => {
                if (error) {
                    console.error("sharp toBuffer", error);
                    resolve(photo);
                } else {
                    resolve(buffer);
                }
            });
        resolve(photo);
    });
};
