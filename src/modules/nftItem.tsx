import Image from "next/image"
interface NftItemProps {
    name: string
    image: string
    network: string
    address: string
    tokenId: string
}

const NftItem = (props: NftItemProps) => {
    const goToNftDetailPage = () => {
        window.location.pathname =
            "/" +
            props.network.toLowerCase() +
            "/" +
            "/collection/" +
            props.address +
            "/" +
            props.tokenId
    }

    return (
        <div className="nft-container" onClick={goToNftDetailPage}>
            <div className="image-container">
                <Image
                    src={
                        props.image == undefined
                            ? ""
                            : props.image.split("/")[0] == "ipfs:"
                            ? "https://ipfs.io/ipfs/" + props.image.slice(7)
                            : props.image
                    }
                    alt=""
                    fill
                />
            </div>
            <div className="name">
                <h3>{props.name}</h3>
            </div>
        </div>
    )
}

export default NftItem
