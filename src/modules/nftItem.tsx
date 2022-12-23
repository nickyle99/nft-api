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
            {props.image != undefined && (
                <div className="image-container">
                    {props.image.slice(props.image.length - 4) == ".mp4" ? (
                        <video className="video" autoPlay muted loop controls>
                            <source
                                src={
                                    props.image.split("/")[0] == "ipfs:"
                                        ? props.image.split("/")[2] == "ipfs"
                                            ? "https://ipfs.io/" + props.image.slice(7)
                                            : "https://ipfs.io/ipfs/" + props.image.slice(7)
                                        : props.image
                                }
                            />
                        </video>
                    ) : (
                        <Image
                            src={
                                props.image.split("/")[0] == "ipfs:"
                                    ? props.image.split("/")[2] == "ipfs"
                                        ? "https://ipfs.io/" + props.image.slice(7)
                                        : "https://ipfs.io/ipfs/" + props.image.slice(7)
                                    : props.image
                            }
                            alt=""
                            fill
                        />
                    )}
                </div>
            )}

            <div className="name">
                <h3>{props.name}</h3>
            </div>
        </div>
    )
}

export default NftItem
