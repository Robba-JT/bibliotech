const sharp = require("sharp");

exports = module.exports.reduce = function (photo) {
    return new Promise((resolve, reject) => {
        sharp(photo)
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
