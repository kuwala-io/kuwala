import baseAxios from "./BaseAxios";
import {BLOCK} from "../constants/api";

export function getAllExistingBlocks (){
    return baseAxios.get(BLOCK)
}