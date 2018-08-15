import { TableExportLang } from "../../src/tools/TableExportLang.js"
import test from "ava";

function testTable(t, table, expTable, expItems) {

    t.truthy(table);
    t.is(table.name, expTable.name);
    t.is(table.showplayers, expTable.showplayers);

    let i = 0;
    for (const itemKey in table.items) {
        const exp = expItems[i++];
        const item = table.items[itemKey];

        t.is(itemKey, exp.val);

        t.is(item.name, exp.val);
        t.is(item.weight, exp.weight);
        t.is(item.avatar, exp.url);
    }
}


test("directions table", t => {

    const result = TableExportLang.parse(`!import-table --Direction --hide
    !import-table-item --Direction --north --1 --
    !import-table-item --Direction --north east --1 --
    !import-table-item --Direction --east --1 --
    !import-table-item --Direction --south east --1 --
    !import-table-item --Direction --south  --1 --
    !import-table-item --Direction --south west --1 --
    !import-table-item --Direction --west --1 --
    !import-table-item --Direction --north west --1 --    
    `);

    t.is(Object.values(result).length, 1);
    t.truthy(result.Direction);

    testTable(e, result.Direction, {
        name: "Direction",
        showplayers: false
    },
        [
            { val: "north", weight: '1', url: "" },
            { val: "north east", weight: '1', url: "" },
            { val: "east", weight: '1', url: "" },
            { val: "south east", weight: '1', url: "" },
            { val: "south", weight: '1', url: "" },
            { val: "south west", weight: '1', url: "" },
            { val: "west", weight: '1', url: "" },
            { val: "north west", weight: '1', url: "" },
        ]);
});

test("no table", t => {
    const tables = TableExportLang.parse("");
    t.truthy(tables);
    t.is(Object.values(tables).length, 0);
});


test("bad command", t => {
    t.throws(() => TableExportLang.parse(`!import-table-itemz`));
});

test("garbage", t => {
    t.deepEqual(TableExportLang.parse(`sgkl;jsilo;gtuwiop35tyr2890573tsUIOghjSLOIrjyhSILOJeypW(#YU^QW*(asdf`), {});
});

test("complex data", t => {
    const result = TableExportLang.parse(`!import-table --<%%97%%>[TABLEEXPORT:ESCAPE]<%%98%%><%%99%%> --hide
    !import-table-item --A[TABLEEXPORT:ESCAPE]BC --Shield[TABLEEXPORT:ESCAPE]Destroyed (roll again if no shield)  --1 --[TABLEEXPORT:ESCAPE]
    !import-table-item --A[TABLEEXPORT:ESCAPE]<%%98%%><%%99%%> --Helm[TABLEEXPORT:ESCAPE]removed (lose ear; stunned 1D6 melees if not helmed)  --1 --[TABLEEXPORT:ESCAPE]
    !import-table-item --<%%97%%>[TABLEEXPORT:ESCAPE]<%%98%%><%%99%%> --Helm[TABLEEXPORT:ESCAPE]removed (lose ear; stunned 1D6 melees)  --500 --[TABLEEXPORT:ESCAPE]
    `);

    t.is(Object.values(result).length, 1);
    t.truthy(result["A--BC"]);

    testTable(e, result["A--BC"], {
        name: "A--BC",
        showplayers: false
    }, [
        { val: "Shield--Destroyed (roll again if no shield)", weight: "1", url: "--" },
        { val: "Helm--removed (lose ear; stunned 1D6 melees if not helmed)", weight: "1", url: "--" },
        { val: "Helm--removed (lose ear; stunned 1D6 melees)", weight: "500", url: "--" }
    ]);
})
