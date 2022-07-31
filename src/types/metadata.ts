export class Metadata {
    public name: string
    public symbol: string
    public description: string
    public seller_fee_basis_point: number
    public image: string
    public attributes: Attribute[]
    public properties: Properties
    public collection: Collection

    constructor(name: string,
                symbol: string,
                description: string,
                seller_fee_basis_point: number,
                image: string,
                attributes: Attribute[],
                properties: Properties,
                collection: Collection) {
        this.name = name
        this.symbol = symbol
        this.description = description
        this.seller_fee_basis_point = seller_fee_basis_point
        this.image = image
        this.attributes = attributes
        this.properties = properties
        this.collection = collection
    }
}


export interface IAttribute {
    trait_type: string
    value: string
}

export class Attribute implements IAttribute {
    public trait_type: string
    public value: string

    constructor(trait_type: string, value: string) {
        this.trait_type = trait_type
        this.value = value
    }
}

export class Properties {
    public creators: Creator[]
    public files: File[]

    constructor(creators: Creator[], files: File[]) {
        this.creators = creators
        this.files = files
    }
}

export interface ICreator {
    address: string
    share: number
}

export class Creator implements ICreator {
    public address: string
    public share: number

    constructor(address: string, share: number) {
        this.address = address
        this.share = share
    }
}

export class File {
    public uri: string
    public type: string

    constructor(uri: string, type: string) {
        this.uri = uri
        this.type = type
    }
}

export interface ICollection {
    name: string
    family: string
}

export class Collection implements ICollection {
    public name: string
    public family: string

    constructor(name: string, family: string) {
        this.name = name
        this.family = family
    }
}
