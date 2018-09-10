interface IOption<T> {
    isSome(): boolean;
    isNone(): boolean;
    unwrap(): T;
}

class Some<T> implements IOption<T> {
    private data: T;
    constructor(data: T) {
        this.data = data;
    }
    isSome = () => true;
    isNone = () => false;
    unwrap = () => this.data;
}

class None<T> implements IOption<T> {
    isSome = () => false;
    isNone = () => true;
    unwrap = () => { throw new Error("Tried to unwrap a None value"); }
}

interface IResult<TData, TError> {
    ok: () => IOption<TData>;
    err: () => IOption<TError>;

    isOk: () => boolean;
    isErr: () => boolean;

    map: <TD, TE>() => IResult<TD, TE>;
}

class Err<TData, TError> implements IResult<TData, TError> {
    private readonly error: TError;
    constructor(error: TError) {
        this.error = error;
    }

    public ok = () => new None<TData>();
    public err = () => new Some<TError>(this.error);

    public isOk = () => false;
    public isErr = () => true;

    public map= <TD, TError>() => new Err<TD, TError>(<any>this.error);
}

class Ok<TData, TError> implements IResult<TData, TError> {
    private readonly data: TData;

    constructor(data: TData) {
        this.data = data;
    }
    
    public ok = () => new Some<TData>(this.data);
    public err = () => new None<TError>();
    
    public isOk = () => true;
    public isErr = () => false;

    public map= <TData, TE>() => new Err<TData, TE>(<any>this.data);
}

export { IResult, Ok, Err, None, Some, IOption }
