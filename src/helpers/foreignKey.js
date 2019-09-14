module.exports = (model, id) => new Promise((resolve, reject) => {
  model.findOne({ _id: id }, (err, result) => {
    if (result) {
      return resolve(true);
    }
    return reject(new Error(`FK Constraint 'checkObjectsExists' for '${id.toString()}' failed`));
  });
});
