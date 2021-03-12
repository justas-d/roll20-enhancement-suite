import { R20 } from "./R20";

let TableIO = {};

TableIO.importJson = function (json) {
  // NOTE(justasd): yeah make sure to version your data. rip.
  // 2021-03-12
  if(!json) return;

  let table = R20.createRollableTable();

  for (let id in json.items) {
    let item = json.items[id];
    delete item.id;

    table.tableitems.create(item);
  }

  delete json.id;
  delete json.items;
  table.save(json);
}

TableIO.exportJson = function(table) {
  return JSON.stringify(table.attributes, null, 4);
}

export { TableIO };
