define("detail", ["collection", "text!../templates/search"], function (collection, template) {
    const detail = function (id) {
        return new Promise((resolve, reject) => {
            if (collection.has(id)) {
                resolve(collection.get(id));
            } else {
                req(`/detail/${id}`).send().then(resolve).catch(reject);
            }
        });
    };

    return {
        detail
    };
});
