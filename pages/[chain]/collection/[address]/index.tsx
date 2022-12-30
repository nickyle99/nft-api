import Head from "next/head"
import { NextPage } from "next"
import { useState, useEffect } from "react"
import Moralis from "moralis"
import { EvmChain } from "@moralisweb3/common-evm-utils"
import config from "../../../../config.json"
import NftItem from "../../../../src/modules/nftItem"
import Activity from "../../../../src/modules/activity"
import Header from "../../../../src/modules/header"

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
    ;[nfts, setNfts] = useState([])
    let activity: any[], setActivity: any
    ;[activity, setActivity] = useState([])
    const [filterInput, setFilterInput] = useState("")
    const [tabBar, setTabBar] = useState("Items")

    useEffect(() => {
        const pathname = window.location.pathname
        switch (pathname.split("/")[1]) {
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
                setName(response?.raw.name ?? "")
                // setCreatedTime(response!.raw.synced_at ? response!.raw.synced_at : "")
            }
            const getActivity = async () => {
                const response = await Moralis.EvmApi.nft.getNFTContractTransfers({
                    address: address,
                    chain: chain,
                })
                setActivity(response.result)
            }

            getNfts()
            getCollectionInfo()
            getActivity()
        }
    }, [chain, address, setNfts, setActivity])

    const changeFilterInput = (e: any) => {
        setFilterInput(e.target.value)
    }

    const filter = async () => {
        const response = await Moralis.EvmApi.nft.searchNFTs({
            q: filterInput,
            filter: "name,attributes",
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
        <>
            <Head>
                <title>Marketplace Demo</title>
                <meta name="description" content="This site to test NFT APIs" />
                <meta name="image" content="https://i.imgur.com/Biu27h2.png" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className="page">
                <div className="container">
                    <Header />
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
                            <span
                                className={tabBar == "Items" ? "active" : ""}
                                onClick={selectTabBar}
                            >
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
                                        onChange={changeFilterInput}
                                    />
                                    <button
                                        onClick={filter}
                                        disabled={filterInput == "" ? true : false}
                                    >
                                        Search
                                    </button>
                                </div>
                                <div className="item-num">
                                    {new Intl.NumberFormat().format(filterItemNumber)} items
                                </div>
                                <div className="nft-list">
                                    {nfts.map((nft) => {
                                        return (
                                            <NftItem
                                                key={
                                                    nft._data == undefined ? "" : nft._data.tokenId
                                                }
                                                name={nft.metadata?.name}
                                                image={nft.metadata?.image}
                                                network={network}
                                                address={address}
                                                tokenId={
                                                    nft._data == undefined ? "" : nft._data.tokenId
                                                }
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
                                                <Activity
                                                    key={
                                                        action._data == undefined
                                                            ? ""
                                                            : action.blockHash + action.logIndex
                                                    }
                                                    tokenId={
                                                        action._data == undefined
                                                            ? ""
                                                            : action.tokenId
                                                    }
                                                    fromAddress={
                                                        action._data == undefined
                                                            ? ""
                                                            : action.fromAddress._value
                                                    }
                                                    toAddress={
                                                        action._data == undefined
                                                            ? ""
                                                            : action.toAddress._value
                                                    }
                                                    quantity={
                                                        action._data == undefined
                                                            ? ""
                                                            : action.amount
                                                    }
                                                    value={
                                                        action._data == undefined
                                                            ? ""
                                                            : action.value
                                                    }
                                                    blockTimestamp={
                                                        action._data == undefined
                                                            ? ""
                                                            : action.blockTimestamp
                                                    }
                                                    transactionHash={
                                                        action._data == undefined
                                                            ? ""
                                                            : action.transactionHash
                                                    }
                                                    network={network}
                                                    collectionAddress={address}
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
        </>
    )
}
export default CollectionPage
