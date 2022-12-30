import Head from "next/head"
import { useState } from "react"
import Moralis from "moralis"
import { EvmChain } from "@moralisweb3/common-evm-utils"
import config from "../config.json"
import Header from "../src/modules/header"

// active moralis module
Moralis.start({
    apiKey: config.MORALIS_API_KEY,
})

export default function Home() {
    const [address, setAddress] = useState("")
    const [ethChosen, setEthChosen] = useState(true)

    const handleInput = (e: any) => {
        setAddress(e.target.value)
    }

    const chooseNetwork = () => {
        setEthChosen(!ethChosen)
    }

    const search = async () => {
        const response = await Moralis.EvmApi.nft.getContractNFTs({
            address: address,
            chain: ethChosen ? EvmChain.ETHEREUM : EvmChain.GOERLI,
            limit: 1,
        })

        if (response.pagination.total) {
            window.location.pathname =
                (ethChosen ? "/ethereum/" : "/goerli/") + "/collection/" + address
        } else {
            window.location.pathname =
                (ethChosen ? "/ethereum/" : "/goerli/") + "/profile/" + address
        }
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
            <main className="page">
                <div className="container">
                    <Header />
                    <div className="address-filter-container">
                        <div className="search">
                            <div className="input">
                                <input
                                    type="text"
                                    placeholder="Enter address to search collection or account"
                                    onChange={handleInput}
                                />
                            </div>
                            <div className="button">
                                <button onClick={search}>Search</button>
                            </div>
                        </div>
                        <div className="radio">
                            <div className="input">
                                <input type="radio" checked={ethChosen} onChange={chooseNetwork} />
                            </div>
                            <div className="label">
                                <label htmlFor="">Ethereum</label>
                            </div>
                            <div className="input">
                                <input type="radio" checked={!ethChosen} onChange={chooseNetwork} />
                            </div>
                            <div className="label">
                                <label htmlFor="">Goerli</label>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    )
}
