import { NextPage } from "next"
import { useState, useEffect } from "react"
import Head from "next/head"
import Moralis from "moralis"
import { EvmChain } from "@moralisweb3/common-evm-utils"
import config from "../../../../config.json"
import Header from "../../../../src/modules/header"
import NftItem from "../../../../src/modules/nftItem"
import Activity from "../../../../src/modules/activity"

// active moralis module
Moralis.start({
    apiKey: config.MORALIS_API_KEY,
})

const ProfilePage: NextPage = () => {
    const [chain, setChain] = useState(EvmChain.ETHEREUM)
    const [network, setNetwork] = useState("")
    const [address, setAddress] = useState("")
    const [exploderUrl, setExploderUrl] = useState("")
    const [tabBar, setTabBar] = useState("Collected")
    let nfts: any[], setNfts: any
    ;[nfts, setNfts] = useState([])
    const [filterInput, setFilterInput] = useState("")
    const [filterItemNumber, setFilterItemNumber] = useState(0)
    let activity: any[], setActivity: any
    ;[activity, setActivity] = useState([])

    useEffect(() => {
        const pathname = window.location.pathname
        let domain = ""
        switch (pathname.split("/")[1]) {
            case "ethereum":
                domain = "etherscan.io"
                setChain(EvmChain.ETHEREUM)
                setNetwork("Ethereum")
                break
            case "goerli":
                domain = "goerli.etherscan.io"
                setChain(EvmChain.GOERLI)
                setNetwork("Goerli")
                break
        }

        setExploderUrl("https://" + domain + "/address/" + pathname.split("/")[3])
        setAddress(pathname.split("/")[3])
    }, [])

    useEffect(() => {
        if (address != "") {
            const getNfts = async () => {
                const response = await Moralis.EvmApi.nft.getWalletNFTs({
                    address: address,
                    chain: chain,
                })
                setNfts(response.result)
                setFilterItemNumber(response.pagination.total)
            }

            const getActivity = async () => {
                const response = await Moralis.EvmApi.nft.getWalletNFTTransfers({
                    address: address,
                    chain: chain,
                })
                setActivity(response.result)
            }

            getNfts()
            getActivity()
        }
    }, [address, chain, setNfts, setActivity])

    const copyAddress = () => {
        navigator.clipboard.writeText(address)
    }

    const selectTabBar = () => {
        tabBar == "Collected" ? setTabBar("Activity") : setTabBar("Collected")
    }

    const changeFilterInput = (e: any) => {
        setFilterInput(e.target.value)
    }

    const filterByName = async () => {}

    return (
        <>
            <Head>
                <title>Marketplace Demo</title>
                <meta name="description" content="This site to test NFT APIs" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className="page">
                <div className="container">
                    <Header />
                    <div className="address-container">
                        <div className="text">
                            <a href={exploderUrl} target="_blank" rel="noopener noreferrer">
                                {address}
                            </a>
                        </div>
                        <div className="button">
                            <button onClick={copyAddress}>Copy</button>
                        </div>
                    </div>
                    <div className="tab-bar">
                        <span
                            className={tabBar == "Collected" ? "active" : ""}
                            onClick={selectTabBar}
                        >
                            Collected
                        </span>
                        <span
                            className={tabBar == "Activity" ? "active" : ""}
                            onClick={selectTabBar}
                        >
                            Activity
                        </span>
                    </div>
                    {tabBar == "Collected" ? (
                        <div className="container-fluid">
                            <div className="search danger">
                                <input
                                    type="text"
                                    placeholder="Does not support filtering by name yet"
                                    onChange={changeFilterInput}
                                />
                                <button
                                    onClick={filterByName}
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
                                                nft._data == undefined
                                                    ? ""
                                                    : nft._data.tokenId + nft.tokenAddress._value
                                            }
                                            name={nft.metadata?.name}
                                            image={nft.metadata?.image}
                                            network={network}
                                            address={nft.tokenAddress._value}
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
                                                    action._data == undefined ? "" : action.tokenId
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
                                                    action._data == undefined ? "" : action.amount
                                                }
                                                value={
                                                    action._data == undefined ? "" : action.value
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
                                                collectionAddress={action.tokenAddress._value}
                                            />
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default ProfilePage
