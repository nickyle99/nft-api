import Image from "next/image"

const Header = () => {
    const goToHome = () => {
        window.location.pathname = ""
    }

    return (
        <div className="header">
            <div className="home-container">
                <div className="image" onClick={goToHome}>
                    <Image
                        src="/vercel.svg"
                        alt="Vercel Logo"
                        className="vercelLogo"
                        fill
                        priority
                    />
                </div>
            </div>
        </div>
    )
}

export default Header
