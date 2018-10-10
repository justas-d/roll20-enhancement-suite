import TransformDirname from '../utils/TransformDirname'

export default function (dirname, hook) {

    hook.filename = TransformDirname(dirname);

    const verifyHas = what => { if (!(what in hook)) throw new Error(`${what} not found in config dirname: ${dirname} id: ${hook.id}`); }

    if(!("gmOnly") in hook) {
        hook.gmOnly = false;
    }

    verifyHas("id");
    verifyHas("filename");

    return hook;
}
