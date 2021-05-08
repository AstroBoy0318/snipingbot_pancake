const web3 = new Web3('https://bsc-dataseed.binance.org/');
var address = '0xca143ce32fe78f1f7019d7d551a6402fc5350c73';
var factoryContract = new web3.eth.Contract(abi, address);

var tokenToBuy = '';

//initial pairs length
var pairs = 0;
//check interval
var interval = 1000;

var statusText = [];
var maxStatusLine = 100;

function getBalance() {
    /*
    //get balance of eth
    var web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/5db0a2fb8a8948fdbe57bb19eecb5674'));
    
    web3.eth.getBalance($("input[name=wallet_address]").val()).then((res)=>alert(web3.utils.fromWei(res,'ether')));
    
    //get balance of bsc
    const web3 = new Web3('https://bsc-dataseed.binance.org/');
    web3.eth.getBalance("0xE0F3fb7Dd6b4238362f197aF8C9A71700538764E").then((res)=>alert(web3.utils.fromWei(res,'ether')));*/
}
function start() {
    tokenToBuy = $("input[name=new_token_contract]").val();
    check();
}
function check() {
    try {
        factoryContract.methods.allPairsLength().call().then((length) => {
            setStatusText("Current pairs length :" + length);
            if (pairs == 0) {
                pairs = length;
                setTimeout(function () {
                    check();
                }, interval);
            }
            else if (length > pairs) {
                checkNewLiquidityRange(pairs,length).then((res)=>{                
                    pairs = length;
                    if(res !== true)
                    {
                        check();
                    }
                });
            }
            else {
                pairs = length;
                setTimeout(function () {
                    check();
                }, interval);
            }
        });
    }catch(error)
    {
        check();
    }
}

async function checkNewLiquidityRange(from, to)
{
    var isNewLiquidity = false;
    for(var i = from; i < to; i++)
    {
        try{
            isNewLiquidity = await checkNewLiquidity(i);
            if(isNewLiquidity === true)
            {
                break;
            }
        }catch(error)
        {
            i--;
        }
    }
    return isNewLiquidity;
}

async function checkNewLiquidity(index)
{
    var pairAddress = await factoryContract.methods.allPairs(index).call();    
    var pairContract = new web3.eth.Contract(abi2, pairAddress);
    var token0 = await pairContract.methods.token0().call();
    var token1 = await pairContract.methods.token1().call();

    if(token0 == tokenToBuy || token1 == tokenToBuy)
    {
        setStatusText("New liquidity contract: " + pairAddress);
        setStatusText("Token 0 Address: " + token0);
        setStatusText("Token 1 Address: " + token1);
        return true;
    }
    return false;
}

function setStatusText(newText) {
    addStatusText(newText);
    var now = new Date();
    addStatusText(now.toLocaleString());
    $("textarea[name=status]").val(statusText.join("\n"));
    $("textarea[name=status]").scrollTop($("textarea[name=status]")[0].scrollHeight);
}

function addStatusText(newText) {
    if (statusText.length >= maxStatusLine) {
        statusText.shift();
    }
    statusText.push(newText);
}