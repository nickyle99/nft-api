import { useState, useEffect } from "react"
import fromnow from "fromnow"

interface CollectionActionProps {
    tokenId: string
    fromAddress: string
    toAddress: string
    quantity: number
    value: any
    blockTimestamp: any
    transactionHash: string
    network: string
}

const CollectionAction = (props: CollectionActionProps) => {
    const [price, setPrice] = useState("")
    const [actionType, setActionType] = useState("")

    useEffect(() => {
        if (props.value.rawValue != undefined) {
            const getPrice = () => {
                const value = props.value.rawValue.value.toString()
                let price = ""
                let length = value.length
                if (length == 1) {
                    price = ""
                } else if (length <= 33) {
                    let firstNumber = value[0]
                    price = "0,"
                    for (let i = 0; i < 36 - length; i++) {
                        price += "0"
                    }
                    price += firstNumber + " ETH"
                } else if (length > 33 && length <= 36) {
                    price = "0,"
                    for (let i = 0; i < 36 - length; i++) {
                        price += "0"
                    }
                    price += value.slice(0, 3 - (36 - length)) + " ETH"
                } else {
                    price =
                        value.slice(0, length - 36) +
                        "," +
                        value.slice(length - 36, length - 33) +
                        " ETH"
                }
                setPrice(price)
            }

            const getActionType = () => {
                if (props.value.rawValue.value.toString().length != 1) {
                    setActionType("Sale")
                } else {
                    if (props.fromAddress == "0x0000000000000000000000000000000000000000") {
                        setActionType("Minted")
                    } else {
                        setActionType("Transfer")
                    }
                }
            }

            getPrice()
            getActionType()
        }
    }, [props.value.rawValue, props.fromAddress])

    return (
        <tr className="action-container">
            <td className="action">{actionType}</td>
            <td className="item">
                <a href=""> #{props.tokenId}</a>
            </td>
            <td className="price">{price}</td>
            <td className="quantity">{props.quantity}</td>
            <td className="from">
                <a href="">{props.fromAddress}</a>
            </td>
            <td className="to">
                <a href="">{props.toAddress}</a>
            </td>
            <td className="time">
                <a href="">
                    {fromnow(props.blockTimestamp) == "just now"
                        ? "just now"
                        : `${fromnow(props.blockTimestamp)} ago`}
                </a>
            </td>
        </tr>
    )
}

export default CollectionAction
