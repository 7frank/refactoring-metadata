import React from 'react'

let x: number | number[]|{test:number} = 0;
const test:string="hello";


interface Props { test1: string }


function getProps() {
    return { x: 1, y: "2" }

}


export function Button(props: Props) {


    return <>{props.test1} { getProps()}</>
}
