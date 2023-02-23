import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Nav, Tab } from "react-bootstrap";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { Web3Provider } from "@ethersproject/providers";
import { useTranslation } from "react-i18next";

//import icon from src/icons/coin.png;

import bitX from "../../../contractAbis/BitX.json";
import bitXStake from "../../../contractAbis/BitXStaking.json";
import { ethers } from "ethers";
import toast, { Toaster } from "react-hot-toast";
import { useState } from "react";
import axiosInstance from "../../../services/AxiosInstance";
import { useDispatch, useSelector } from "react-redux";
import { ThemeContext } from "../../../context/ThemeContext";
import { useContext } from "react";
import Loader from "../Loader/Loader";
import { Logout } from "../../../store/actions/AuthActions";

const Stake = () => {
  const { t } = useTranslation();
  const [loader, setLoader] = useState(false);
  const { changeBackground } = useContext(ThemeContext);
  useEffect(() => {
    changeBackground({ value: "dark", label: "Dark" });
  }, []);

  const [stakeData, setStakeData] = useState([]);
  const [stakedData, setStakedData] = useState([]);

  const state = useSelector((state) => state);

  const [startTime, setstartTime] = useState(new Date());
  const [timeDifference, setTimeDifference] = useState(null);
  const [totalAmountStaked, setTotalAmountStaked] = useState(0);
  const [amountAlreadyStaked, setAmountAlreadyStaked] = useState(0);
  const [totalAmountClaimed, setTotalAmountClaimed] = useState(0);
  const [amountToStake, SetAmountToStake] = useState(0);

  const [staking, setStaking] = useState();
  const [bxg, setbxg] = useState();
  const [stakingId, setStakingId] = useState();

  //async function

  const getStakingData = async () => {
    setStaking(
      new ethers.Contract(bitXStake.address, bitXStake.abi, state.auth.signer)
    );
    setbxg(new ethers.Contract(bitX.address, bitX.abi, state.auth.signer));
  };

  useEffect(() => {
    getStakingData();
  }, []);

  //create a function to check weather the user has staked once or not
  //if staked once then return true else return false
  const checkStake = async () => {
    const data1 = await axiosInstance.get(
      "/api/stake/" + state.auth.auth.walletaddress
    );
    var check = data1.data.bxg ? true : false;
    return check;
  };

  const FetchData = async () => {
    setLoader(true);
    const requestBody = {
      wallet_address: state.auth.auth.walletaddress,
    };
    //const {data} = await axiosInstance.get('/api/bxg/'+requestBody.wallet_address);
    const data1 = await axiosInstance.get(
      "/api/stake/" + requestBody.wallet_address
    );
    const data = await axiosInstance.get(
      "/api/stakehistory/" + requestBody.wallet_address
    );
    setStakeData(data?.data?.filter((item) => item.type === "Stake"));

    //filter data.data and add all the bxg values and set it to totalamountclaimed
    var amountclaimed = 0;
    data.data.filter((item) => {
      if (item.type === "claim") {
        amountclaimed = amountclaimed + item.bxg;
      }
    });

    var amountstaked = 0;
    data.data.filter((item) => {
      if (item.type === "Stake") {
        amountstaked = amountstaked + item.bxg;
      }
    });

    data.data.filter((item) => {
      if (item.type === "Staked") {
        amountstaked = amountstaked + item.bxg;
      }
    });

    setTotalAmountStaked(amountstaked);
    setTotalAmountClaimed(amountclaimed);
    setAmountAlreadyStaked(data1.data.bxg);
    const date = new Date(data1.data.stake_time);

    setstartTime(date);
    setLoader(false);
  };
  useEffect(() => {
    FetchData();
  }, []);

  //handleclaim

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleStake = async () => {
    const logout = () => {
      dispatch(Logout(navigate));
    };

    let address = "";
    let signer = {};
    if (state.auth.isLoggedInFromMobile == "mobile") {
      const RPC_URLS = {
        1: "https://bsc-dataseed1.binance.org/",
      };
      const provider = new WalletConnectProvider({
        rpc: {
          1: RPC_URLS[1],
        },
        qrcode: true,
      });
      const accounts = await provider.enable();
      const library = new Web3Provider(provider, "any");
      signer = library.getSigner();
      address = accounts[0];
    } else {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      signer = provider.getSigner();
      const addresses = await provider.send("eth_requestAccounts", []);
      address = addresses[0];
    }
    const staking = new ethers.Contract(
      bitXStake.address,
      bitXStake.abi,
      signer
    );
    const bxg = new ethers.Contract(bitX.address, bitX.abi, signer);
    if (address !== state.auth.auth.walletaddress) {
      toast.error("Wrong account is selected, Logging Out", {
        position: "top-center",
        style: { minWidth: 180 },
      });
      setTimeout(logout, 1000);
      return;
    }

    setLoader(true);
    if (amountToStake <= 0) {
      toast.error("Please enter amount to stake", {
        position: "top-center",
        style: { minWidth: 180 },
      });
    } else {
      //check if the user has staked once or not
      //if staked once then call stake function else call stakeAndClaim function
      var check = await checkStake();
      if (!check) {
        if (amountToStake < 20) {
          setLoader(false);
          toast.error("Minimum amount to stake is 20 BXG", {
            position: "top-center",
            style: { minWidth: 180 },
          });
          return;
        }
      }

      try {
        // input from user
        const amount = ethers.utils.parseEther(amountToStake);
        const amountApprove = ethers.utils.parseEther(
          "100000000000000000000000000000000000000000"
        );
        const value = await bxg.allowance(
          state.auth.auth.walletaddress,
          staking.address
        );
        ////console.log("Approval Value", value.toString());
        if (value < amount) {
          await (await bxg.approve(staking.address, amountApprove)).wait();
        }
        const tx = await (await staking.stake(amount)).wait();
        ////console.log(tx.events, "tx");
        const stakedId = tx.events[2].args.stakedId;
        //console.log(stakedId.toString(), "stake id");
        //console.log(parseInt(stakedId), "stake id");
        //console.log(parseInt(stakedId).toString(), "stake id");
        setStakingId(stakedId.toString()); // send this id to the backend
        if (tx.events) {
          toast.success(tx.blockHash, {
            position: "top-center",
            style: { minWidth: 180 },
          });
          const requestBody = {
            wallet_address: state.auth.auth.walletaddress,
            bxg: amountToStake,
            blockhash: tx.blockHash,
            stake_id: stakedId.toString(),
          };

          const { data } = await axiosInstance
            .post("/api/stake/", requestBody)
            .catch((err) => {
              toast.error(err.response.data, {
                position: "top-center",
                style: { minWidth: 180 },
              });
            });
          if (data.stake_time) {
            // const date = new Date(data.stake_time);
            // setstartTime(date);
            setTotalAmountStaked(data.bxg);
            toast.success("Staked Successfully", {
              position: "top-center",
              style: { minWidth: 180 },
            });
            FetchData();
          } else {
            toast.error(data.message, {
              position: "top-center",
              style: { minWidth: 180 },
            });
          }
        } else {
          //console.log("Transaction Failed");
          toast.error("Transaction Failed", {
            position: "top-center",
            style: { minWidth: 180 },
          });
        }
      } catch (error) {
        //console.log(error, "Transaction Failed");
        toast.error("Transaction Failed", {
          position: "top-center",
          style: { minWidth: 180 },
        });
      }
    }
    setLoader(false);
  };

  const handleUnstake = async (bxgvalue) => {
    setLoader(true);

    if (bxgvalue <= 0) {
      toast.error("Please Enter Value Greater then Zero", {
        position: "top-center",
        style: { minWidth: 180 },
      });
    } else {
      try {
        const amount = await ethers.utils.parseEther(bxgvalue.toString());
        const tx = await (await staking.unStake(amount, stakingId)).wait(); //  replace this value
        if (tx.events) {
          toast.success(tx.blockHash, {
            position: "top-center",
            style: { minWidth: 180 },
          });
          const requestBody = {
            wallet_address: state.auth.auth.walletaddress,
            bxg: bxgvalue,
            blockhash: tx.blockHash,
          };
          const { data } = await axiosInstance
            .put("/api/stake/", requestBody)
            .catch((err) => {
              toast.error(err.response.data.message, {
                position: "top-center",
                style: { minWidth: 180 },
              });
            });
          if (data.stake_time) {
            //setstartTime(data.stake_time);
            setTotalAmountStaked(data.bxg);
            toast.success("UnStaked Successfully", {
              position: "top-center",
              style: { minWidth: 180 },
            });
          }
        } else {
          toast.error("Transaction Failed", {
            position: "top-center",
            style: { minWidth: 180 },
          });
        }
      } catch (error) {
        toast.error("Transaction Failed", {
          position: "top-center",
          style: { minWidth: 180 },
        });
      }
    }
    setLoader(false);
  };

  const handleClaim = async (id, bxgvalue1, stakingID) => {
    const logout = () => {
      dispatch(Logout(navigate));
    };
    const addresses = await state.auth.provider.send("eth_requestAccounts", []);
    const address = addresses[0];
    console.log(state.auth.auth.walletaddress, address);
    if (address !== state.auth.auth.walletaddress) {
      toast.error("Wrong account is selected, Logging Out", {
        position: "top-center",
        style: { minWidth: 180 },
      });
      setTimeout(logout, 1000);
      return;
    }

    //console.log(stakingID.toString());

    //console.log("IN CLAIMING ");
    setLoader(true);

    //console.log(bxgvalue1.toString());
    if (bxgvalue1 <= 0) {
      toast.error("Amount less then Zero", {
        position: "top-center",
        style: { minWidth: 180 },
      });
    } else {
      try {
        const amount = await ethers.utils.parseEther(bxgvalue1.toString());
        const stakingId = await ethers.utils.parseEther(stakingID.toString());
        const tx = await (
          await staking.withdraw(amount, stakingID.toString())
        ).wait(); //  replace this value
        if (tx.events) {
          toast.success(tx.blockHash, {
            position: "top-center",
            style: { minWidth: 180 },
          });
          const requestBody = {
            wallet_address: state.auth.auth.walletaddress,
            bxg: bxgvalue1,
            stake_id: stakingID.toString(),
            blockhash: tx.blockHash,
            type: "claim",
          };
          const { data } = await axiosInstance
            .put("/api/stake/" + id, requestBody)
            .catch((err) => {
              toast.error(err.response.data, {
                position: "top-center",
                style: { minWidth: 180 },
              });
            });
          if (data.stake_time) {
            //setstartTime(new Date());
            setTotalAmountStaked(data.bxg);
            toast.success("Claimed Successfully", {
              position: "top-center",
              style: { minWidth: 180 },
            });
            FetchData();
          }
        } else {
          toast.error("Transaction Failed", {
            position: "top-center",
            style: { minWidth: 180 },
          });
        }
      } catch (error) {
        toast.error(error.reason, {
          position: "top-center",
          style: { minWidth: 180 },
        });
      }
    }
    setLoader(false);
  };

  const timer = (StartTime) => {
    const startTimeObject = new Date(StartTime);

    let string1 = "";
    const currentTime = new Date();
    const difference = currentTime - startTimeObject;
    //const months = Math.floor(difference / (1000 * 60 * 60 * 24 * 30));
    const days = Math.floor(
      (difference % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24)
    );
    const hours = Math.floor(
      (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    string1 = `${days}d ${hours}h ${minutes}m ${seconds}s `;

    return string1;
  };

  const getType = (StartTime) => {
    const startTimeObject = new Date(StartTime);

    let string1 = "";
    const currentTime = new Date();
    const difference = currentTime - startTimeObject;
    const months = Math.floor(difference / (1000 * 60 * 60 * 24 * 30));
    const days = Math.floor(
      (difference % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24)
    );

    if (months >= 0 || days >= 0) {
      string1 = "Claim";
    } else {
      string1 = "UnStake";
    }
    return string1;
  };

  const getDate = (date) => {
    const dateObject = new Date(date);
    return dateObject.toLocaleString();
  };

  const interval = setInterval(() => {
    setStakedData(stakeData);
  }, 1000);

  return (
    <>
      <Toaster />

      {loader === true ? (
        <Loader />
      ) : (
        <>
          <div
            className="row "
            style={{
              justifyContent: "center",
              alignItems: "center",
              marginTop: "50px",
            }}
          >
            <div
              className="col-sm-12 col-12 col-xl-7"
              style={{ height: "100%" }}
            >
              <div className="col-xl-12 col-sm-12">
                <div className="card h-auto">
                  <div className="card-body px-0 pt-1">
                    <Tab.Container defaultActiveKey="Navbuy">
                      <div className="">
                        <div className="buy-sell">
                          <Nav
                            className="nav nav-tabs"
                            eventKey="nav-tab2"
                            role="tablist"
                          >
                            <Nav.Link
                              as="button"
                              className="nav-link"
                              eventKey="Navbuy"
                              type="button"
                            >
                              {t("stake_header")}
                            </Nav.Link>
                            <Nav.Link
                              as="button"
                              className="nav-link"
                              eventKey="Navsell"
                              type="button"
                            >
                              {timeDifference?.months > 0
                                ? t("claim_header")
                                : t("claim_header")}
                            </Nav.Link>
                          </Nav>
                        </div>
                        <Tab.Content>
                          <Tab.Pane eventKey="Navbuy">
                            <Tab.Container defaultActiveKey="Navbuymarket">
                              <Tab.Content id="nav-tabContent1">
                                <Tab.Pane eventKey="Navbuymarket"></Tab.Pane>
                                <Tab.Pane eventKey="Navbuylimit"></Tab.Pane>
                              </Tab.Content>
                              <div className="sell-element">
                                <div className="col-xl-12">
                                  <form className="flex-direction-row justify-content-center">
                                    <div className="sell-blance">
                                      <br></br>
                                      <label className="form-label text-primary">
                                        Amount
                                      </label>

                                      <div className="form-label blance">
                                        <span>
                                          {t("amount_already_staked")}:
                                        </span>
                                        <p>{amountAlreadyStaked} BXG</p>
                                      </div>
                                      <br></br>
                                      <div className="input-group">
                                        <input
                                          value={amountToStake}
                                          onChange={(e) => {
                                            SetAmountToStake(e.target.value);
                                          }}
                                          type="text"
                                          className="form-control"
                                          placeholder="0.00"
                                        />
                                        <span className="input-group-text">
                                          BXG
                                        </span>
                                      </div>
                                    </div>

                                    {/* {!checkStake() && (
                                      <div style={{ color: "red" }}>
                                        Minimum 20 BXG
                                      </div>
                                    )} */}
                                    <br></br>
                                  </form>
                                </div>

                                <div className="text-center">
                                  <Button
                                    //in the onclick function set start time to current time
                                    // onClick={() => setstartTime(new Date())}
                                    onClick={() => {
                                      handleStake();
                                    }}
                                    //to={"/exchange"}
                                    className="btn btn-success w-75"
                                    // disabled={amountToStake < 20}
                                  >
                                    {t("stake_header")}
                                  </Button>
                                </div>
                              </div>
                            </Tab.Container>
                          </Tab.Pane>
                          <Tab.Pane eventKey="Navsell">
                            <Tab.Container defaultActiveKey="Navsellmarket">
                              <Tab.Content id="nav-tabContent2">
                                <Tab.Pane id="Navsellmarket"></Tab.Pane>
                                <Tab.Pane id="Navselllimit"></Tab.Pane>
                              </Tab.Content>
                              <div className="card">
                                <div className="card-header border-0 pb-0">
                                  <h4 className="heading mb-0">
                                    {" "}
                                    {t("claim_header")}
                                  </h4>
                                </div>
                                <div className="card-body pt-2 pb-0">
                                  <table className="table shadow-hover orderbookTable">
                                    <thead>
                                      <tr>
                                        <th>Value(BXG)</th>
                                        <th>Staked Date</th>
                                        <th>Timer</th>
                                        <th>Claim</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {stakeData.map((data, index) => (
                                        <tr key={index}>
                                          <td>
                                            <span
                                              className={`${
                                                getType(data.stake_time) ===
                                                "Claim"
                                                  ? "text-success"
                                                  : "text-danger"
                                              }`}
                                            >
                                              {data.bxg}BXG
                                            </span>
                                          </td>
                                          <td>{getDate(data.stake_time)}</td>
                                          <td>{timer(data.stake_time)}</td>

                                          <td>
                                            {getType(data.stake_time) ===
                                              "Claim" && (
                                              <Link
                                                onClick={() => {
                                                  getType(data.stake_time) ===
                                                  "Claim"
                                                    ? handleClaim(
                                                        data.id,
                                                        data.bxg,
                                                        data.stake_id
                                                      )
                                                    : handleUnstake(data.bxg);
                                                }}
                                                className="btn btn-warning mr-0 "
                                              >
                                                {getType(data.stake_time)}
                                              </Link>
                                            )}
                                            {getType(data.stake_time) ===
                                              "UnStake" && (
                                              <Link
                                                style={{
                                                  background: "#dddddd",
                                                }}
                                                className="btn btn-warning mr-0 "
                                              >
                                                Claim
                                              </Link>
                                            )}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </Tab.Container>
                          </Tab.Pane>
                        </Tab.Content>
                      </div>
                    </Tab.Container>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-sm-12 col-12 col-xl-4">
              <div className="col-xl-12" style={{ height: "100%" }}>
                <div className="card">
                  <div className="card-wiget-info"></div>
                  <div className="card-body pb-2">
                    <div className="card-wiget-info">
                      <br></br>
                      <h4 className="count-num">{totalAmountStaked} BXG</h4>
                      <p>{t("total_amount_staked")}</p>
                      <div>
                        {/* <svg className="me-1" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
										<path d="M19.6997 12.4191C18.364 17.7763 12.9382 21.0365 7.58042 19.7006C2.22486 18.365 -1.03543 12.9388 0.300792 7.582C1.63577 2.22424 7.06166 -1.03636 12.4179 0.299241C17.7753 1.63487 21.0353 7.06169 19.6997 12.4191Z" fill="#F7931A"/>
										<path d="M6.71062 11.684C6.65625 11.8191 6.51844 12.0215 6.20781 11.9447C6.21877 11.9606 5.41033 11.7456 5.41033 11.7456L4.86566 13.0015L6.29343 13.3575C6.55906 13.424 6.81938 13.4937 7.07563 13.5594L6.62155 15.3825L7.71748 15.6559L8.16716 13.8522C8.46655 13.9334 8.75716 14.0084 9.04153 14.079L8.5934 15.8743L9.6906 16.1477L10.1446 14.3281C12.0156 14.6821 13.4224 14.5393 14.0146 12.8472C14.4918 11.4847 13.9909 10.6987 13.0065 10.1862C13.7234 10.0209 14.2633 9.54937 14.4074 8.57532C14.6065 7.24471 13.5933 6.5294 12.208 6.05221L12.6574 4.24971L11.5602 3.97627L11.1227 5.73126C10.8343 5.65938 10.538 5.59157 10.2437 5.52437L10.6843 3.75781L9.58775 3.48438L9.13807 5.28623C8.89931 5.23186 8.66496 5.17808 8.43745 5.12154L8.43869 5.1159L6.92557 4.7381L6.63368 5.90996C6.63368 5.90996 7.44775 6.09653 7.43056 6.10808C7.87494 6.21902 7.95524 6.51307 7.94182 6.74622L6.71062 11.684ZM11.9006 12.0906C11.5615 13.4531 9.26747 12.7165 8.52372 12.5318L9.12622 10.1166C9.86995 10.3022 12.2549 10.6697 11.9006 12.0906ZM12.2399 8.55564C11.9306 9.79501 10.0212 9.16533 9.40183 9.01096L9.94808 6.82033C10.5674 6.97471 12.5621 7.26283 12.2399 8.55564Z" fill="white"/>
									</svg> */}
                        {/* <span>0.00</span> */}
                      </div>
                    </div>
                    <br></br>
                    <hr></hr>

                    <div className="card-wiget-info">
                      <br></br>
                      <h4 className="count-num">{totalAmountClaimed} BXG</h4>
                      <p>{t("total_amount_claimed")}</p>
                      <div>
                        {/* <svg className="me-1" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
										<path d="M19.6997 12.4191C18.364 17.7763 12.9382 21.0365 7.58042 19.7006C2.22486 18.365 -1.03543 12.9388 0.300792 7.582C1.63577 2.22424 7.06166 -1.03636 12.4179 0.299241C17.7753 1.63487 21.0353 7.06169 19.6997 12.4191Z" fill="#F7931A"/>
										<path d="M6.71062 11.684C6.65625 11.8191 6.51844 12.0215 6.20781 11.9447C6.21877 11.9606 5.41033 11.7456 5.41033 11.7456L4.86566 13.0015L6.29343 13.3575C6.55906 13.424 6.81938 13.4937 7.07563 13.5594L6.62155 15.3825L7.71748 15.6559L8.16716 13.8522C8.46655 13.9334 8.75716 14.0084 9.04153 14.079L8.5934 15.8743L9.6906 16.1477L10.1446 14.3281C12.0156 14.6821 13.4224 14.5393 14.0146 12.8472C14.4918 11.4847 13.9909 10.6987 13.0065 10.1862C13.7234 10.0209 14.2633 9.54937 14.4074 8.57532C14.6065 7.24471 13.5933 6.5294 12.208 6.05221L12.6574 4.24971L11.5602 3.97627L11.1227 5.73126C10.8343 5.65938 10.538 5.59157 10.2437 5.52437L10.6843 3.75781L9.58775 3.48438L9.13807 5.28623C8.89931 5.23186 8.66496 5.17808 8.43745 5.12154L8.43869 5.1159L6.92557 4.7381L6.63368 5.90996C6.63368 5.90996 7.44775 6.09653 7.43056 6.10808C7.87494 6.21902 7.95524 6.51307 7.94182 6.74622L6.71062 11.684ZM11.9006 12.0906C11.5615 13.4531 9.26747 12.7165 8.52372 12.5318L9.12622 10.1166C9.86995 10.3022 12.2549 10.6697 11.9006 12.0906ZM12.2399 8.55564C11.9306 9.79501 10.0212 9.16533 9.40183 9.01096L9.94808 6.82033C10.5674 6.97471 12.5621 7.26283 12.2399 8.55564Z" fill="white"/>
									</svg> */}
                        {/* <span>0.00</span> */}
                      </div>
                      <br></br>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};
export default Stake;
