export default <TIn, TData>(a: TIn, b: TIn, dataSelector: (val: TIn) => TData) : number=> {
    const aVal = dataSelector(a);
    const bVal = dataSelector(b);
    if(aVal < bVal) return -1;
    if(aVal > bVal) return 1;
    return 0;
};