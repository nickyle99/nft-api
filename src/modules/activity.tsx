import { useState, useEffect } from "react"
import fromnow from "fromnow"

interface ActivityProps {
    tokenId: string
    fromAddress: string
    toAddress: string
    quantity: number
    value: any
    blockTimestamp: any
    transactionHash: string
    network: string
    collectionAddress: string
}

const Activity = (props: ActivityProps) => {
    const [exploderUrl, setExploderUrl] = useState("")
    const [price, setPrice] = useState("")
    const [actionType, setActionType] = useState("")
    const [fromNow, setFromNow] = useState("")

    useEffect(() => {
        if (props.value.rawValue != undefined) {
            const getExploderUrl = () => {
                let domain = ""
                switch (props.network) {
                    case "Ethereum":
                        domain = "etherscan.io"
                        break
                    case "Goerli":
                        domain = "goerli.etherscan.io"
                        break
                }
                setExploderUrl("https://" + domain + "/tx/" + props.transactionHash)
            }

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
                    price += firstNumber
                } else if (length > 33 && length <= 36) {
                    price = "0,"
                    for (let i = 0; i < 36 - length; i++) {
                        price += "0"
                    }
                    price += value.slice(0, 3 - (36 - length))
                } else {
                    price =
                        value.slice(0, length - 36) + "," + value.slice(length - 36, length - 33)
                }
                setPrice(price)
            }

            const getActionType = () => {
                if (props.fromAddress == "0x0000000000000000000000000000000000000000") {
                    setActionType("Minted")
                } else if (props.value.rawValue.value.toString().length == 1) {
                    setActionType("Transfer")
                } else {
                    setActionType("Sale")
                }
            }

            const getFromNow = () => {
                const timeByFromNow = fromnow(props.blockTimestamp)
                if (timeByFromNow == "just now") {
                    setFromNow(timeByFromNow)
                } else {
                    if (timeByFromNow.includes(",")) {
                        setFromNow(timeByFromNow.split(",")[0] + " ago")
                    } else {
                        setFromNow(timeByFromNow + " ago")
                    }
                }
            }

            getExploderUrl()
            getPrice()
            getActionType()
            getFromNow()
        }
    }, [props])

    return (
        <tr className="action-container">
            <td className="action">{actionType}</td>
            {props.tokenId != "" && (
                <td className="item">
                    <a
                        href={
                            window.location.origin +
                            "/" +
                            props.network.toLowerCase() +
                            "/collection/" +
                            props.collectionAddress +
                            "/" +
                            props.tokenId
                        }
                    >
                        #{props.tokenId}
                    </a>
                </td>
            )}
            <td className="price">
                <p>
                    <span>{price}</span>
                    {price != "" && " ETH"}
                </p>
            </td>
            <td className="quantity">
                <p>{props.quantity}</p>
            </td>
            <td className="from">
                <a
                    href={
                        window.location.origin +
                        "/" +
                        props.network.toLowerCase() +
                        "/profile/" +
                        props.fromAddress
                    }
                >
                    {props.fromAddress}
                </a>
            </td>
            <td className="to">
                <a
                    href={
                        window.location.origin +
                        "/" +
                        props.network.toLowerCase() +
                        "/profile/" +
                        props.toAddress
                    }
                >
                    {props.toAddress}
                </a>
            </td>
            <td className="time">
                <a href={exploderUrl} target="_blank" rel="noopener noreferrer">
                    {fromNow}
                </a>
            </td>
        </tr>
    )
}

export default Activity
