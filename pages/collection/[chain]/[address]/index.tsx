import { NextPage } from "next"
import { useState, useEffect } from "react"
import Moralis from "moralis"
import { EvmChain, EvmNft } from "@moralisweb3/common-evm-utils"
import config from "../../../../config.json"
import NftItem from "../../../../src/modules/nftItem"
import CollectionAction from "../../../../src/modules/collectionAction"

// active moralis module
Moralis.start({
    apiKey: config.MORALIS_API_KEY,
})

const CollectionPage: NextPage = () => {
    const [chain, setChain] = useState(EvmChain.ETHEREUM)
    const [network, setNetwork] = useState("")
    const [address, setAddress] = useState("")
    const [name, setName] = useState("")
    const [totalItems, setTotalItems] = useState(0)
    const [filterItemNumber, setFilterItemNumber] = useState(0)
    // const [createdTime, setCreatedTime] = useState("")
    let nfts: any[], setNfts: any
    ;[nfts, setNfts] = useState([{}])
    let activity: any[], setActivity: any
    ;[activity, setActivity] = useState([{}])
    const [attributeInput, setAttributeInput] = useState("")
    const [tabBar, setTabBar] = useState("Items")

    useEffect(() => {
        const pathname = window.location.pathname
        switch (pathname.split("/")[2]) {
            case "ethereum":
                setChain(EvmChain.ETHEREUM)
                setNetwork("Ethereum")
                break
            case "goerli":
                setChain(EvmChain.GOERLI)
                setNetwork("Goerli")
                break
        }
        setAddress(pathname.split("/")[3])
    }, [])

    useEffect(() => {
        if (address != "") {
            const getNfts = async () => {
                const response = await Moralis.EvmApi.nft.getContractNFTs({
                    address: address,
                    chain: chain,
                })
                setNfts(response.result)
                setTotalItems(response.pagination.total)
                setFilterItemNumber(response.pagination.total)
            }
            const getCollectionInfo = async () => {
                const response = await Moralis.EvmApi.nft.getNFTContractMetadata({
                    address: address,
                    chain: chain,
                })
                setName(response!.raw.name)
                // setCreatedTime(response!.raw.synced_at ? response!.raw.synced_at : "")
            }
            const getActivity = async () => {
                const response = await Moralis.EvmApi.nft.getNFTContractTransfers({
                    address: address,
                    chain: chain,
                })
                setActivity(response.result)
                console.log(response.result)
            }

            getNfts()
            getCollectionInfo()
            getActivity()
        }
    }, [chain, address, setNfts, setActivity])

    const changeAttributeInput = (e: any) => {
        setAttributeInput(e.target.value)
    }

    const filter = async (option: string) => {
        const response = await Moralis.EvmApi.nft.searchNFTs({
            q: attributeInput,
            filter: option == "name" ? "name" : "attributes",
            chain: chain,
            addresses: [address],
        })
        setFilterItemNumber(response.pagination.total)
        var nftList: any[] = new Array()
        response.result.forEach((nft) => {
            nftList.push(nft.token)
        })
        setNfts(nftList)
    }

    const selectTabBar = () => {
        setTabBar(tabBar == "Items" ? "Activity" : "Items")
    }

    return (
        <div className="page">
            <div className="container">
                <div className="general-info">
                    <div className="collection-name">{name}</div>
                    <div className="collection-details">
                        <div>
                            Items <span>{new Intl.NumberFormat().format(totalItems)}</span>
                        </div>
                        <div>
                            Created <span className="danger">Not supported yet</span>
                        </div>
                        <div>
                            Chain <span>{network}</span>
                        </div>
                    </div>
                </div>
                <div className="body">
                    <div className="tab-bar">
                        <span className={tabBar == "Items" ? "active" : ""} onClick={selectTabBar}>
                            Items
                        </span>
                        <span
                            className={tabBar == "Activity" ? "active" : ""}
                            onClick={selectTabBar}
                        >
                            Activity
                        </span>
                    </div>
                    {tabBar == "Items" ? (
                        <div className="container-fluid">
                            <div className="search">
                                <input
                                    type="text"
                                    placeholder="Search by name or attribute"
                                    onChange={changeAttributeInput}
                                />
                                <button
                                    onClick={() => {
                                        filter("name")
                                    }}
                                    disabled={attributeInput == "" ? true : false}
                                >
                                    Search by name
                                </button>
                                <button
                                    onClick={() => {
                                        filter("attributes")
                                    }}
                                    disabled={attributeInput == "" ? true : false}
                                >
                                    Search by attribute
                                </button>
                            </div>
                            <div className="item-num">
                                {new Intl.NumberFormat().format(filterItemNumber)} items
                            </div>
                            <div className="nft-list">
                                {nfts.map((nft) => {
                                    return (
                                        <NftItem
                                            key={nft._data == undefined ? "" : nft._data.tokenId}
                                            name={nft._data?.metadata.name}
                                            image={nft._data?.metadata.image}
                                        />
                                    )
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="activity-container">
                            <div className="notification danger">
                                Not yet support to get name and image!
                            </div>
                            <table>
                                <tbody>
                                    <tr>
                                        <th>Action</th>
                                        <th>Item</th>
                                        <th>Price</th>
                                        <th>Quantity</th>
                                        <th>From</th>
                                        <th>To</th>
                                        <th>Time</th>
                                    </tr>
                                    {activity.map((action) => {
                                        return (
                                            <CollectionAction
                                                key={
                                                    action._data == undefined
                                                        ? ""
                                                        : action._data.blockHash +
                                                          action._data.logIndex
                                                }
                                                tokenId={
                                                    action._data == undefined
                                                        ? ""
                                                        : action._data.tokenId
                                                }
                                                fromAddress={
                                                    action._data == undefined
                                                        ? ""
                                                        : action._data.fromAddress._value
                                                }
                                                toAddress={
                                                    action._data == undefined
                                                        ? ""
                                                        : action._data.toAddress._value
                                                }
                                                quantity={
                                                    action._data == undefined
                                                        ? ""
                                                        : action._data.amount
                                                }
                                                value={
                                                    action._data == undefined
                                                        ? ""
                                                        : action._data.value
                                                }
                                                blockTimestamp={
                                                    action._data == undefined
                                                        ? ""
                                                        : action._data.blockTimestamp
                                                }
                                                transactionHash={
                                                    action._data == undefined
                                                        ? ""
                                                        : action._data.transactionHash
                                                }
                                                network={network}
                                            />
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
export default CollectionPage
