import { IsPositive, IsString, MinLength, IsNumber, IsOptional, IsInt, IsArray, IsIn } from "class-validator";

export class CreateProductDto { // el dto hace la conexión entre la request y el controller, define como tiene que llegar la data!

    @IsString()
    @MinLength(1)
    title: string;

    @IsNumber()
    @IsPositive()
    @IsOptional()
    price?: number;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    slug?: string;

    @IsInt()
    @IsPositive()
    @IsOptional()
    stock?: number;

    @IsString({ each: true }) // dicto que cada uno de los elementos del array tiene que ser un string
    @IsArray()
    sizes: string[];

    @IsIn(['men', 'women', 'kid', 'unisex'])
    gender: string;
    
}
