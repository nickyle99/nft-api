import { NextPage } from "next"
import { useState, useEffect } from "react"
import Image from "next/image"
import Moralis from "moralis"
import { EvmChain } from "@moralisweb3/common-evm-utils"
import config from "../../../../../config.json"
import Activity from "../../../../../src/modules/activity"
import Header from "../../../../../src/modules/header"

// active moralis module
Moralis.start({
    apiKey: config.MORALIS_API_KEY,
})

const NftDetailPage: NextPage = () => {
    const [chain, setChain] = useState(EvmChain.ETHEREUM)
    const [network, setNetwork] = useState("")
    const [address, setAddress] = useState("")
    const [tokenId, setTokenId] = useState("")
    const [collectionName, setCollectionName] = useState("")
    const [collectionPageUrl, setCollectionPageUrl] = useState("")
    const [ownerProfileUrl, setOwnerProfileUrl] = useState("")
    let owner: any, setOwner: any
    ;[owner, setOwner] = useState({})
    let metadata: any, setMetadata: any
    ;[metadata, setMetadata] = useState({})
    let attributes: any[], setAttributes: any
    ;[attributes, setAttributes] = useState([])
    let activity: any[], setActivity: any
    ;[activity, setActivity] = useState([])
    const [refreshing, setRefreshing] = useState(false)

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
        setTokenId(pathname.split("/")[4])

        const urlParts = window.location.href.split("/")
        let collectionUrl = urlParts[0]
        for (let i = 1; i < urlParts.length - 1; i++) {
            collectionUrl += "/" + urlParts[i]
        }
        setCollectionPageUrl(collectionUrl)
    }, [])

    useEffect(() => {
        if (address != "" && tokenId != "") {
            const getNftMetadata = async () => {
                const response = await Moralis.EvmApi.nft.getNFTMetadata({
                    address: address,
                    chain: chain,
                    tokenId: tokenId,
                })

                setMetadata(response?.result.metadata ?? {})
                setCollectionName(response?.result.name ?? "")
                setOwner(response?.result.ownerOf ?? {})
            }

            const getActivity = async () => {
                const response = await Moralis.EvmApi.nft.getNFTTransfers({
                    address: address,
                    chain: chain,
                    tokenId: tokenId,
                })
                setActivity(response.result)
            }

            getNftMetadata()
            getActivity()
        }
    }, [chain, address, tokenId, setMetadata, setOwner, setActivity])

    useEffect(() => {
        if (metadata?.name != undefined) {
            const getAttributes = async () => {
                let attributeList = metadata.attributes ?? []
                for (let i = 0; i < attributeList.length; i++) {
                    const totalItemsSameTrait = await Moralis.EvmApi.nft.searchNFTs({
                        q: attributeList[i].trait_type,
                        filter: "attributes",
                        chain: chain,
                        addresses: [address],
                        limit: 1,
                    })
                    const totalItemsSameValue = await Moralis.EvmApi.nft.searchNFTs({
                        q: attributeList[i].value,
                        filter: "attributes",
                        chain: chain,
                        addresses: [address],
                        limit: 1,
                    })
                    attributeList[i].rate = (
                        (totalItemsSameValue.pagination.total /
                            totalItemsSameTrait.pagination.total) *
                        100
                    ).toFixed(2)
                    setAttributes([...attributeList])
                }
            }

            getAttributes()
        }
    }, [metadata, chain, address, setAttributes])

    useEffect(() => {
        if (owner._value != undefined) {
            const pathname = window.location.pathname
            const origin = window.location.origin
            setOwnerProfileUrl(origin + "/" + pathname.split("/")[1] + "/profile/" + owner._value)
        }
    }, [owner])

    const refreshMetadata = async () => {
        setRefreshing(true)
        await Moralis.EvmApi.nft.reSyncMetadata({
            address: address,
            tokenId: tokenId,
            chain: chain,
        })
        setTimeout(() => {
            setRefreshing(false)
        }, 5000)
    }

    return (
        <div className="page">
            <div className="nft-detail-container">
                <Header />
                <div className="metadata-container">
                    <div className="left">
                        <div className="image">
                            <Image src={metadata?.image ?? ""} alt="" fill></Image>
                        </div>
                    </div>
                    <div className="right">
                        <div className="name-section">
                            <div className="text">
                                <div className="collection-name">
                                    <a href={collectionPageUrl}>{collectionName}</a>
                                </div>
                                <div className="nft-name">
                                    <p>{metadata?.name}</p>
                                </div>
                            </div>
                            <div className="refresh-metadata">
                                <button onClick={refreshMetadata} disabled={refreshing}>
                                    Refresh metadata
                                </button>
                            </div>
                        </div>
                        <div className="owner">
                            <p>
                                Owned by <a href={ownerProfileUrl}>{owner._value}</a>
                            </p>
                        </div>
                        <div className="description">
                            <h1>Description</h1>
                            <p>{metadata?.description}</p>
                        </div>
                        <div className="attributes-text">
                            <p>Properties:</p>
                        </div>
                        <div className="attributes">
                            {attributes?.map((attribute) => {
                                return (
                                    <div key={attribute.trait_type ?? ""} className="attribute">
                                        <div className="trait">
                                            <p>{attribute.trait_type}</p>
                                        </div>
                                        <div className="value">
                                            <p>{attribute.value}</p>
                                        </div>
                                        <div className="rate">
                                            <p>{attribute.rate ?? "--"}% have this trait</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
                <div className="activity-container">
                    <div className="nft-history-container">
                        <table>
                            <tbody>
                                <tr>
                                    <th>Action</th>
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
                                            tokenId={""}
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
                                            value={action._data == undefined ? "" : action.value}
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
                </div>
            </div>
        </div>
    )
}

export default NftDetailPage
