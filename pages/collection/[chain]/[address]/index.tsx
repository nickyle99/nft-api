import { NextPage } from "next"
import { useState, useEffect } from "react"
import Moralis from "moralis"
import { EvmChain, EvmNft } from "@moralisweb3/common-evm-utils"
import config from "../../../../config.json"
import NftItem from "../../../../src/modules/nftItem"

// active moralis module
Moralis.start({
    apiKey: config.MORALIS_API_KEY,
})

const CollectionPage: NextPage = () => {
    const [chain, setChain] = useState(EvmChain.ETHEREUM)
    const [chainText, setChainText] = useState("")
    const [address, setAddress] = useState("")
    const [name, setName] = useState("")
    const [totalItems, setTotalItems] = useState(0)
    // const [createdTime, setCreatedTime] = useState("")
    let nfts: any[]
    let setNfts: any
    ;[nfts, setNfts] = useState([{}])
    const [attributeInput, setAttributeInput] = useState("")
    const [tabBar, setTabBar] = useState("Items")

    useEffect(() => {
        const pathname = window.location.pathname
        switch (pathname.split("/")[2]) {
            case "ethereum":
                setChain(EvmChain.ETHEREUM)
                setChainText("Ethereum")
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
                console.log(response.result)
                setTotalItems(response.pagination.total)
            }
            const getCollectionInfo = async () => {
                const response = await Moralis.EvmApi.nft.getNFTContractMetadata({
                    address: address,
                    chain: chain,
                })
                setName(response!.raw.name)
                // setCreatedTime(response!.raw.synced_at ? response!.raw.synced_at : "")
            }

            getNfts()
            getCollectionInfo()
        }
    }, [chain, address, setNfts])

    const filterByAttribute = async () => {
        const response = await Moralis.EvmApi.nft.searchNFTs({
            q: attributeInput,
            filter: "attributes",
            chain: chain,
            addresses: [address],
        })
        setNfts(response.result)
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
                            Items <span>{totalItems}</span>
                        </div>
                        <div>
                            Created <span className="danger">Not supported yet</span>
                        </div>
                        <div>
                            Chain <span>{chainText}</span>
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
                    {tabBar == "Items" && (
                        <div className="container-fluid">
                            <div className="search">
                                <input type="text" placeholder="Search by name or attribute" />
                                <button>Search</button>
                            </div>
                            <div className="nft-list">
                                {nfts.map((nft) => {
                                    return (
                                        <NftItem
                                            key={nft._data == undefined ? "" : nft._data?.tokenId}
                                        />
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
export default CollectionPage
