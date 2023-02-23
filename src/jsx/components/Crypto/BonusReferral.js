import React, { useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import Select from "react-select";
import { Badge, Card, Col, Dropdown, Table } from "react-bootstrap";
import { useTranslation } from 'react-i18next';

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
import Loader from "../Loader/Loader";
const BonusReferral = () => {
  const state = useSelector((state) => state);

  const { changeBackground } = useContext(ThemeContext);
  useEffect(() => {
    changeBackground({ value: "dark", label: "Dark" });
  }, []);
  const { t, i18n } = useTranslation();
  const [loader, setLoader] = useState(false);
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const [addresses, setaddresses] = useState([]);
  const [address, setaddress] = useState();
  const [swap, setswap] = useState();
  const [bitXGold, setbitXGold] = useState();

  const [referCode, setReferCode] = useState("0x0000000000000000000000");
  const [isrefered, setIsrefered] = useState(false);
  const [referralData, setReferralData] = useState([]);
  //total usdt value

  //create handlesell

  const getSellData = async () => {
    setaddresses(await provider.send("eth_requestAccounts", []));
    setaddress(addresses[0]);
    setswap(new ethers.Contract(bitXSwap.address, bitXSwap.abi, signer));
    setbitXGold(new ethers.Contract(bitX.address, bitX.abi, signer));
  };

  const getFormattedDate = (date) => {
    //get only day and month in english
    const d = new Date(date);
    const month = d.toLocaleString("default", { month: "short" });
    const day = d.getDate();
    return `${day} ${month}`;
  };

  const FetchData = async () => {
    setLoader(true);
    try {
      const { data } = await axiosInstance
        .get("/api/bonusrefreward/" + state.auth.auth.walletaddress)
        .catch((err) => {
          toast.error("Server Error", {
            position: "top-center",
            style: { minWidth: 180 },
          });
        });

      const isreferedData = await axiosInstance
        .get("/api/bonusrefer/" + state.auth.auth.walletaddress)
        .catch((err) => {
          toast.error("Server Error", {
            position: "top-center",
            style: { minWidth: 180 },
          });
        });

        
      if (isreferedData.data.isRefered) {
        setReferCode(isreferedData.data.refer_code);
      } else {
      }

      setReferralData(data);
    } catch (err) {
      toast.error("Error Occured", {
        position: "top-center",
        style: { minWidth: 180 },
      });
    }

    setLoader(false);
  };

  useEffect(() => {
    FetchData();
  }, []);

  useEffect(() => {
    getSellData();
    FetchData();
  }, []);

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

      {loader === true ? (
        <Loader />
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
                {t('invite_your_contacts')}
              </h1>
              <p className="font-w600 fs-60 mt-2">
                {t('invite_description')}
                </p>
              <br></br>

              <div className="row">
                <div className="col-xl-12">
                  <div className=" mt-3 row ">
                    <div className="col-xl-10">
                      <div className="row">
                        <label>{t('refer_code_title')}</label>
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
                            {t('copy_code_button')}
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
              <Card.Title>{t('you_are_currently_referred_by')}</Card.Title>
            </Card.Header>
            <Card.Body>
              <Table responsive>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>{t('your_wallet')}</th>
                    <th>{t('referred_wallet')}</th>
                  </tr>
                </thead>
                <tbody>
                  {/* {idhr map lgega} */}

                  <tr>
                    <th>1</th>
                    <td>{state.auth.auth.walletaddress}</td>
                    <td>
                      {referCode === "0x0000000000000000000000"
                        ? "No one Has Referred You"
                        : referCode}
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={12}>
          <Card>
            <Card.Header>
              <Card.Title>{t('referred_transaction')}</Card.Title>
            </Card.Header>
            <Card.Body>
              <Table responsive>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>{t('wallet_address')}</th>

                    <th>{t('date')}</th>
                    <th>USDT</th>
                  </tr>
                </thead>
                <tbody>
                  {referralData.map((data, index) => (
                    <tr key={index}>
                      <th>{index + 1}</th>
                      <td>{data.wallet_address}</td>

                      <td>{getFormattedDate(data.createdAt)}</td>
                      <td className="color-success">{data.reward} USDT</td>
                    </tr>
                  ))}

                  {/* {idhr map lgega} */}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </div>)}
    </>
  );
};
export default BonusReferral;
