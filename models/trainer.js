var Model = require('model.js').Model;

function Trainer() {}

for (member in Model.prototype) {
    Trainer.prototype[member] = Model.prototype[member];
}

module.exports.Trainer = Trainer;
