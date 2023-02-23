import React, { useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import Select from "react-select";
import { Badge, Card, Col, Dropdown, Row, Table } from "react-bootstrap";

//import icon from src/icons/coin.png;
import bxgicon from "../../../icons/buy and sell/tokenbxg.png";
import usdicon from "../../../icons/buy and sell/usdtt.png";
import bitX from "../../../contractAbis/BitX.json";
import bitXSwap from "../../../contractAbis/BitXGoldSwap.json";
import { ethers } from "ethers";
import toast, { Toaster } from "react-hot-toast";
import { useState } from "react";
import axiosInstance from "../../../services/AxiosInstance";
import { ThemeContext } from "../../../context/ThemeContext";
import axios from "axios";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

const StakingReferral = () => {
  const { t, i18n } = useTranslation();
  const state = useSelector((state) => state);

  const { changeBackground } = useContext(ThemeContext);
  useEffect(() => {
    changeBackground({ value: "dark", label: "Dark" });
  }, []);

  // create a static value of 0.16130827463

  const [loader, setLoader] = useState(false);
  const [stakingReferalData, setStakingReferalData] = useState([]);
  const [level1count, setLevel1Count] = useState(0);
  const [level2count, setLevel2Count] = useState(0);
  const [level3count, setLevel3Count] = useState(0);
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const [addresses, setaddresses] = useState([]);
  const [address, setaddress] = useState();
  const [swap, setswap] = useState();
  const [bitXGold, setbitXGold] = useState();
  //total usdt value

  //create handlesell

  const getFormattedDate = (date) => {
    //get only day and month in english
    const d = new Date(date);
    const month = d.toLocaleString("default", { month: "short" });
    const day = d.getDate();
    return `${day} ${month}`;
  };

  const getSellData = async () => {
    setaddresses(await provider.send("eth_requestAccounts", []));
    setaddress(addresses[0]);
    setswap(new ethers.Contract(bitXSwap.address, bitXSwap.abi, signer));
    setbitXGold(new ethers.Contract(bitX.address, bitX.abi, signer));
  };

  useEffect(() => {
    getSellData();
    FetchData();
  }, []);

  const FetchData = async () => {
    setLoader(true);
    try {
      const response = await axiosInstance
        .get("/api/refer/getall")
        .then((response) => {
          //console.log(response.data);
          var level1 = 0;
          var level2 = 0;
          var level3 = 0;
          response.data.map((item) => {
            //console.log(item.refer1);
            if (item?.refer1?.toLowerCase() == state.auth.auth.walletaddress) {
              level1 = level1 + 1;
            }
            if (item?.refer2?.toLowerCase() == state.auth.auth.walletaddress) {
              level2 = level2 + 1;
            }
            if (item?.refer3?.toLowerCase() == state.auth.auth.walletaddress) {
              level3 = level3 + 1;
            }
          });

          setLevel1Count(level1);
          setLevel2Count(level2);
          setLevel3Count(level3);
        });

      const { data } = await axiosInstance
        .get("/api/stakerefreward/" + state.auth.auth.walletaddress)
        .catch((err) => {
          //console.log("Error", err);
        });

      //console.log(data);

      if (data) {
        setStakingReferalData(data);
      }

      //match the address with the refer1 and refer2 and refer3 and count the number of matches and set the count to the state of level1count, level2count and level3count
      // if(response.data.length > 0)
      // {

      //  }
    } catch (err) {
      toast.error("Error Fetching Data", {
        position: "top-center",
        style: { minWidth: 180 },
      });
    }
    setLoader(false);
  };

  function myFunction() {
    // Get the text field
    var copyText = document.getElementById("myInput");

    // Select the text field
    copyText.select();
    copyText.setSelectionRange(0, 99999); // For mobile devices

    // Copy the text inside the text field
    navigator.clipboard.writeText(copyText.value);

    // Alert the copied text
    toast.success("Copied Referral Code: " + copyText.value, {
      position: "top-center",
      style: { minWidth: 180 },
    });
  }
  return (
    <>
      <Toaster />
      {loader ? (
        <Toaster />
      ) : (
        <div
          className="row "
          style={{
            justifyContent: "center",
            alignItems: "center",
            marginTop: "50px",
          }}>
          <div className="col-xl-12" style={{ height: "100%" }}>
            <div className="card">
              <div className="card-body pb-2">
                <br></br>
                <h1 className="no-border font-w600 fs-60 mt-2">
                  {t("invite_your_contacts")}
                </h1>
                <p className="font-w600 fs-60 mt-2">
                  {t("invite_description")}
                </p>
                <br></br>

                <div className="row">
                  <div className="col-xl-12">
                    <div className=" mt-3 row ">
                      <div className="col-xl-10">
                        <div className="row">
                          <label>{t("refer_code_title")}</label>
                          <div className="input-group mb-3">
                            <input
                              id="myInput"
                              disabled={true}
                              value={state.auth.auth.walletaddress}
                              style={{ height: 60 }}
                              type="text"
                              className="form-control"
                            />
                            <button
                              onClick={myFunction}
                              className="btn btn-success"
                              type="button">
                              {t("copy_code_button")}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <br></br>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Col lg={12}>
            <Card>
              <Card.Header>
                <Card.Title>{t("refers_by_level")}</Card.Title>
              </Card.Header>
              <Card.Body>
                <Row className="text-center" lg={4}>
                  <Col lg={4}>
                    <Card.Title>{t("level_1")}</Card.Title>
                  </Col>
                  <Col lg={4}>
                    <Card.Title>{t("level_2")}</Card.Title>
                  </Col>
                  <Col lg={4}>
                    <Card.Title>{t("level_3")}</Card.Title>
                  </Col>
                </Row>

                <Row className="text-center " lg={4}>
                  <Col lg={4}>{level1count}</Col>
                  <Col lg={4}>{level2count}</Col>
                  <Col lg={4}>{level3count}</Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={12}>
            <Card>
              <Card.Header>
                <Card.Title>{t("referred_transaction")}</Card.Title>
              </Card.Header>
              <Card.Body>
                <Table responsive>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>{t("wallet_address")}</th>
                      <th>{t("level")}</th>
                      <th>{t("date")}</th>
                      <th>BXG</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stakingReferalData.map((item, index) => {
                      return (
                        <tr>
                          <th>{index + 1}</th>
                          <td>{item.wallet_address}</td>
                          <td>
                            {" "}
                            <Badge bg="" className={"badge-success success"}>
                              {t("level")} {item.level}
                            </Badge>{" "}
                          </td>
                          <td>{getFormattedDate(item.createdAt)}</td>
                          <td className="color-primary">{item.reward} BXG</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </div>
      )}
    </>
  );
};
export default StakingReferral;
