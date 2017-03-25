define("detail", ["lodash", "Request", "collection", "text!../templates/search"], function (_, request, collection, template) {
    const detail = function (id) {
        return new Promise((resolve, reject) => {
            if (collection.has(id)) {
                resolve(collection.get(id));
            } else {
                request(`/detail/${id}`).send().then(resolve).catch(reject);
            }
        });
    };

    return {
        detail
    };
});
