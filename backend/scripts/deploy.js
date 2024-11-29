async function main() {
    const PollContract = await ethers.getContractFactory('PollContract');
    const pollContract = await PollContract.deploy();
    await pollContract.deployed();
  
    console.log('PollContract deployed to:', pollContract.address);
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Error deploying contract:', error);
      process.exit(1);
    });
  