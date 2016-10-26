const sharp = require("sharp"),
    Q = require("q");

exports = module.exports.reduce = function (photo) {
    return new Q.Promise((resolve, reject) => {
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
