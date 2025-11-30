
const hre = require("hardhat");

async function main() {
    const address = "0x3841f920A0Ee56Bb75e7D5150ca31Bd641979d1a";
    console.log(`Checking code at ${address} on network: ${hre.network.name}`);
    const code = await hre.ethers.provider.getCode(address);
    if (code === "0x") {
        console.log("❌ No code found at this address.");
    } else {
        console.log("✅ Code found at this address.");
    }
}

main().catch(console.error);
