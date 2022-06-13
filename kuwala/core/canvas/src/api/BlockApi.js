import baseAxios from "./BaseAxios";
import {BLOCK} from "../constants/api";

export async function getAllExistingBlocks (){
    return baseAxios.get(BLOCK)
}