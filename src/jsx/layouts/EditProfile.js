import React, { useState, useEffect, useContext } from 'react';
//import { Dropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Select from 'react-select';
import { connect, useDispatch } from "react-redux";
import toast, { Toaster } from "react-hot-toast";
import axiosInstance from '../../services/AxiosInstance';
import { ThemeContext } from "../../context/ThemeContext";
import { useTranslation } from 'react-i18next';


const EditProfile = (props) => {

    const { t } = useTranslation();

    const { changeBackground } = useContext(ThemeContext);
    useEffect(() => {
        changeBackground({ value: "dark", label: "Dark" });
    }, []);
    const [profileData, setprofileData] = useState({
        id: "",
        email: "",
        whatsapp: ""
    });
    const [email, setemail] = useState("");
    const [whatsapp, setwhatsapp] = useState("");

    const getdata = async () => {
        const { data } = await axiosInstance.get('/api/profile/' + props.state.auth.walletaddress);
        setprofileData(data);
        setemail(data.email)
        setwhatsapp(data.whatsapp)
    }

    async function update() {
        try {
            
            if (email === "" || whatsapp === "") {
                toast.error("Please Enter Required Fileds", {
                    style: { minWidth: 180 },
                    position: "top-center",
                });
            }
            else {
                const mesg = await axiosInstance.put('/api/profile/' + profileData.id, { email: email, whatsapp: whatsapp });
                if (mesg.data === "updated") {

                    toast.success("updated successfully ", {
                        style: { minWidth: 180 },
                        position: "top-center",
                    });
                    getdata();
                }
                else {
                    toast.error("some thing went wrong", {
                        style: { minWidth: 180 },
                        position: "top-center",
                    });

                }
            }

        }
        catch (err) {
            toast.error("Network Error Try Again Later", {
                style: { minWidth: 180 },
                position: "top-center",
            });

        }
    }
    useEffect(() => {
        getdata();
    }, []);

    return (
        <>
            <Toaster />
            <div className="row">
                <div className="col-xl-3 col-lg-4">
                    <div className="clearfix">
                        <div className="card card-bx profile-card author-profile m-b30">
                            <div className="card-body">
                                <div className="p-5">
                                    <div className="author-profile">
                                       
                                        <div className="author-info">
                                            <h6 className="title">{props.state.auth.walletaddress}</h6>
                                            <span></span>
                                        </div>
                                    </div>
                                </div>
                                <div className="info-list">
                                    <ul>
                                        <li style={{ padding: "18px 18px", flexWrap: "wrap", justifyContent: "center", flexDirection: "column" }}><Link>{t('whatsapp')}</Link>

                                            <span>{profileData.whatsapp}</span>

                                        </li>
                                        <li style={{ padding: "18px 18px", flexWrap: "wrap", justifyContent: "center", flexDirection: "column" }} ><Link>{t('email')}</Link><span>{profileData.email}</span></li>

                                    </ul>
                                </div>
                            </div>
                            {/* <div className="card-footer">
                                <div className="input-group mb-3">
                                    <div className="form-control rounded text-center bg-white">Portfolio</div>
                                </div>
                                <div className="input-group">
                                    <a href="https://www.dexignzone.com/" target="blank" className="form-control text-primary rounded text-start bg-white">https://www.dexignzone.com/</a>
                                </div>
                            </div> */}
                        </div>
                    </div>
                </div>
                <div className="col-xl-9 col-lg-8">
                    <div className="card profile-card card-bx m-b30">
                        <div className="card-header">
                            <h6 className="title">{t('account_setup')}</h6>
                        </div>
                        <form className="profile-form">
                            <div className="card-body">
                                <div className='row'>
                                    <div className="col-sm-6 m-b30">
                                        <label className="form-label">{t('whatsapp_number')}</label>
                                        <input type="text" className="form-control" value={whatsapp} onChange={(e) => setwhatsapp(e.target.value)}
                                        />
                                    </div>
                                    <div className="col-sm-6 m-b30">
                                        <label className="form-label">{t('email_address')}</label>
                                        <input type="text" className="form-control" value={email} onChange={(e) => setemail(e.target.value)}
                                        />
                                    </div>
                                </div>
                                {/* 
                                <div className="row">
                                    {inputBlog.map((item, ind) => (
                                        <div className="col-sm-6 m-b30" key={ind}>
                                            <label className="form-label">{item.label}</label>
                                            <input type="text" className="form-control" defaultValue={item.value} />
                                        </div>
                                    ))}

                                    <div className="col-sm-6 m-b30">
                                        <label className="form-label">Gender</label>
                                        <Select options={options2} className="custom-react-select"
                                            defaultValue={options2[0]}
                                            isSearchable={false}
                                        />

                                    </div>
                                    <div className="col-sm-6 m-b30">
                                        <label className="form-label">Birth</label>
                                        <input type="text" className="form-control" placeholder="dd. mm .yyyy" />
                                    </div>
                                    <div className="col-sm-6 m-b30">
                                        <label className="form-label">WhatsApp number</label>
                                        <input type="text" className="form-control" defaultValue="+123456789" />
                                    </div>
                                    <div className="col-sm-6 m-b30">
                                        <label className="form-label">Email address</label>
                                        <input type="text" className="form-control" defaultValue="demo@gmail.com" />
                                    </div>
                                    <div className="col-sm-6 m-b30">
                                        <label className="form-label">Country</label>
                                        <Select options={options3} className="custom-react-select"
                                            defaultValue={options3[0]}
                                            isSearchable={false}
                                        />
                                    </div>
                                    <div className="col-sm-6 m-b30">
                                        <label className="form-label">City</label>
                                        <Select options={options4} className="custom-react-select"
                                            defaultValue={options4[0]}
                                            isSearchable={false}
                                        />
                                    </div>
                                </div> */}
                            </div>
                            <div className="card-footer">
                                <div onClick={update} className="btn btn-primary">{t('update')}</div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}
const mapStateToProps = (state) => {
    return {
        state: state.auth
    };
};
export default connect(mapStateToProps)(EditProfile);
