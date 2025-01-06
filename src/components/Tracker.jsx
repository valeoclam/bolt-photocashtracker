import React, { useState, useRef, useEffect } from 'react';
    import { v4 as uuidv4 } from 'uuid';
    import * as EXIF from 'exifreader';
    import imageCompression from 'browser-image-compression';
    import { Link, useNavigate } from 'react-router-dom';

    function Tracker() {
      const [logs, setLogs] = useState(() => {
        const storedLogs = sessionStorage.getItem('cashLogs');
        return storedLogs ? JSON.parse(storedLogs) : [];
      });
      const [inputAmount, setInputAmount] = useState('');
      const [cashOutAmount, setCashOutAmount] = useState('');
      const [mainPhoto, setMainPhoto] = useState(null);
      const [winningPhotos, setWinningPhotos] = useState(() => []);
      const [addTime, setAddTime] = useState(null);
      const [modifyTime, setModifyTime] = useState(null);
      const [editingLogId, setEditingLogId] = useState(null);
      const mainPhotoInputRef = useRef(null);
      const winningPhotoInputRef = useRef(null);
      const videoRef = useRef(null);
      const canvasRef = useRef(null);
      const [isCameraActive, setIsCameraActive] = useState(false);
      const [isWinningCameraActive, setIsWinningCameraActive] = useState(false);
      const [modalImage, setModalImage] = useState(null);
      const [confirmDeleteId, setConfirmDeleteId] = useState(null);
      const navigate = useNavigate();

      useEffect(() => {
        sessionStorage.setItem('cashLogs', JSON.stringify(logs));
      }, [logs]);

      const handleMainPhotoChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
          await processPhoto(file);
        }
      };

      const processPhoto = async (file) => {
        try {
          const compressedFile = await imageCompression(file, {
            maxSizeMB: 1,
            maxWidthOrHeight: 500,
          });
          const reader = new FileReader();
          reader.onloadend = async () => {
            setMainPhoto(reader.result);
            setAddTime(new Date().toLocaleString());
            setModifyTime(new Date().toLocaleString());
          };
          reader.readAsDataURL(compressedFile);
        } catch (error) {
          console.error('Error compressing image:', error);
        }
      };

      const handleWinningPhotoChange = async (e) => {
        const files = Array.from(e.target.files);
        if (files && files.length > 0) {
          for (const file of files) {
            await processWinningPhoto(file);
          }
        }
      };

      const processWinningPhoto = async (file) => {
        try {
          const compressedFile = await imageCompression(file, {
            maxSizeMB: 1,
            maxWidthOrHeight: 500,
          });
          const reader = new FileReader();
          reader.onloadend = () => {
            setWinningPhotos((prevPhotos) => [...prevPhotos, reader.result]);
          };
          reader.readAsDataURL(compressedFile);
        } catch (error) {
          console.error('Error compressing winning image:', error);
        }
      };

      const handleOpenCamera = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setIsCameraActive(true);
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
        }
      };

      const handleOpenWinningCamera = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setIsWinningCameraActive(true);
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
        }
      };

      const handleTakePhoto = async () => {
        if (videoRef.current && canvasRef.current) {
          const video = videoRef.current;
          const canvas = canvasRef.current;
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/png');
          try {
            const compressedFile = await imageCompression(
              dataURLtoFile(dataUrl, 'photo.png'),
              {
                maxSizeMB: 1,
                maxWidthOrHeight: 500,
              },
            );
            const reader = new FileReader();
            reader.onloadend = () => {
              setMainPhoto(reader.result);
              setAddTime(new Date().toLocaleString());
              setModifyTime(new Date().toLocaleString());
            };
            reader.readAsDataURL(compressedFile);
          } catch (error) {
            console.error('Error compressing camera image:', error);
          }
          setIsCameraActive(false);
          if (video.srcObject) {
            video.srcObject.getTracks().forEach((track) => track.stop());
          }
        }
      };

      const handleTakeWinningPhoto = async () => {
        if (videoRef.current && canvasRef.current) {
          const video = videoRef.current;
          const canvas = canvasRef.current;
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/png');
          try {
            const compressedFile = await imageCompression(
              dataURLtoFile(dataUrl, 'winning-photo.png'),
              {
                maxSizeMB: 1,
                maxWidthOrHeight: 500,
              },
            );
            const reader = new FileReader();
            reader.onloadend = () => {
              setWinningPhotos((prevPhotos) => [...prevPhotos, reader.result]);
            };
            reader.readAsDataURL(compressedFile);
          } catch (error) {
            console.error('Error compressing camera image:', error);
          }
          setIsWinningCameraActive(false);
          if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
          }
        }
      };

      const dataURLtoFile = (dataurl, filename) => {
        let arr = dataurl.split(','),
          mime = arr[0].match(/:(.*?);/)[1],
          bstr = atob(arr[arr.length - 1]),
          n = bstr.length,
          u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
      };

      const handleSubmit = (e) => {
        e.preventDefault();
        if (!mainPhoto) {
          alert('请先拍摄或上传照片');
          return;
        }
        const newLog = {
          id: uuidv4(),
          inputAmount: parseFloat(inputAmount),
          cashOutAmount: parseFloat(cashOutAmount),
          mainPhoto: mainPhoto,
          winningPhotos: winningPhotos,
          addTime: addTime,
          modifyTime: modifyTime,
        };
        setLogs((prevLogs) => [...prevLogs, newLog]);
        setInputAmount('');
        setCashOutAmount('');
        setMainPhoto(null);
        setWinningPhotos(() => []);
        setAddTime(null);
        setModifyTime(null);
        if (mainPhotoInputRef.current) {
          mainPhotoInputRef.current.value = '';
        }
        if (winningPhotoInputRef.current) {
          winningPhotoInputRef.current.value = '';
        }
      };

      const handleImageClick = (image) => {
        setModalImage(image);
      };

      const handleCloseModal = () => {
        setModalImage(null);
      };

      const handleInputChange = (e) => {
        if (e.target.value !== '') {
          setModifyTime(new Date().toLocaleString());
        }
        if (e.target.type === 'number') {
          if (e.target.id === 'inputAmount') {
            setInputAmount(e.target.value);
          } else if (e.target.id === 'cashOutAmount') {
            setCashOutAmount(e.target.value);
          }
        }
      };

      const handleEditLog = (log) => {
        setEditingLogId(log.id);
        setInputAmount(log.inputAmount);
        setCashOutAmount(log.cashOutAmount);
        setMainPhoto(log.mainPhoto);
        setWinningPhotos(() => log.winningPhotos);
        setAddTime(log.addTime);
        setModifyTime(log.modifyTime);
      };

      const handleUpdateLog = (e) => {
        e.preventDefault();
        const updatedLogs = logs.map((log) => {
          if (log.id === editingLogId) {
            return {
              ...log,
              inputAmount: parseFloat(inputAmount),
              cashOutAmount: parseFloat(cashOutAmount),
              mainPhoto: mainPhoto,
              winningPhotos: winningPhotos,
              modifyTime: new Date().toLocaleString(),
            };
          }
          return log;
        });
        setLogs(updatedLogs);
        setEditingLogId(null);
        setInputAmount('');
        setCashOutAmount('');
        setMainPhoto(null);
        setWinningPhotos(() => []);
        setAddTime(null);
        setModifyTime(null);
        navigate('/');
      };

      const handleDeleteLog = (id) => {
        if (confirmDeleteId === id) {
          const updatedLogs = logs.filter((log) => log.id !== id);
          setLogs(updatedLogs);
          setConfirmDeleteId(null);
        } else {
          setConfirmDeleteId(id);
        }
      };

      const handleRemoveWinningPhoto = (indexToRemove) => {
        setWinningPhotos((prevPhotos) =>
          prevPhotos.filter((_, index) => index !== indexToRemove),
        );
      };

      const displayedLogs = logs.slice(-3).reverse();

      return (
        <div className="container">
          <h1>Photo Cash Tracker</h1>
          <Link to="/history" className="link-button">查看所有记录</Link>
          <form onSubmit={editingLogId ? handleUpdateLog : handleSubmit}>
            <div className="form-group">
              <label>拍摄照片:</label>
              {!isCameraActive ? (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleMainPhotoChange}
                    ref={mainPhotoInputRef}
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    onClick={() => mainPhotoInputRef.current.click()}
                  >
                    选择照片
                  </button>
                  <button
                    type="button"
                    className="camera-button"
                    onClick={handleOpenCamera}
                  >
                    打开相机
                  </button>
                </>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    width="320"
                    height="240"
                  />
                  <canvas ref={canvasRef} style={{ display: 'none' }} />
                  <button type="button" onClick={handleTakePhoto}>
                    拍照
                  </button>
                </>
              )}
              {mainPhoto && (
                <img
                  src={mainPhoto}
                  alt="Main Preview"
                  className="image-preview"
                  onClick={() => handleImageClick(mainPhoto)}
                />
              )}
            </div>
            <div className="form-group">
              <label>投入金额:</label>
              <input
                type="number"
                id="inputAmount"
                value={inputAmount}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>兑换金额:</label>
              <input
                type="number"
                id="cashOutAmount"
                value={cashOutAmount}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>中奖照片 (可选):</label>
              {!isWinningCameraActive ? (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleWinningPhotoChange}
                    ref={winningPhotoInputRef}
                    style={{ display: 'none' }}
                    multiple
                  />
                  <button
                    type="button"
                    onClick={() => winningPhotoInputRef.current.click()}
                  >
                    选择照片
                  </button>
                  <button
                    type="button"
                    className="camera-button"
                    onClick={handleOpenWinningCamera}
                  >
                    打开相机
                  </button>
                </>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    width="320"
                    height="240"
                  />
                  <canvas ref={canvasRef} style={{ display: 'none' }} />
                  <button type="button" onClick={handleTakeWinningPhoto}>
                    拍照
                  </button>
                </>
              )}
              {winningPhotos &&
                winningPhotos.map((photo, index) => (
                  <div key={index} style={{display: 'inline-block', position: 'relative'}}>
                    <img
                      src={photo}
                      alt={`Winning Preview ${index + 1}`}
                      className="image-preview"
                      onClick={() => handleImageClick(photo)}
                    />
                    {editingLogId && (
                      <button
                        type="button"
                        style={{position: 'absolute', top: 0, right: 0, backgroundColor: 'red', color: 'white', border: 'none', cursor: 'pointer'}}
                        onClick={() => handleRemoveWinningPhoto(index)}
                      >
                        X
                      </button>
                    )}
                  </div>
                ))}
            </div>
            <button type="submit">
              {editingLogId ? '更新记录' : '添加记录'}
            </button>
            {editingLogId && (
              <button type="button" onClick={() => {setEditingLogId(null); setInputAmount(''); setCashOutAmount(''); setMainPhoto(null); setWinningPhotos([]); navigate('/')}}>
                取消编辑
              </button>
            )}
          </form>
          <h2>最近记录</h2>
          {displayedLogs.map((log) => (
            <div key={log.id} className="log-item">
              <p>
                <strong>添加时间:</strong> {log.addTime}
              </p>
              {log.modifyTime && (
                <p>
                  <strong>修改时间:</strong> {log.modifyTime}
                </p>
              )}
              <p>
                <strong>投入金额:</strong> {log.inputAmount}
              </p>
              <p>
                <strong>兑换金额:</strong> {log.cashOutAmount}
              </p>
              <p>
                <strong>盈亏金额:</strong> {log.cashOutAmount - log.inputAmount}
              </p>
              {log.mainPhoto && (
                <img
                  src={log.mainPhoto}
                  alt="Main Log"
                  onClick={() => handleImageClick(log.mainPhoto)}
                />
              )}
              {log.winningPhotos &&
                log.winningPhotos.map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`Winning Log ${index + 1}`}
                    onClick={() => handleImageClick(photo)}
                  />
                ))}
              <button
                className="edit-button"
                onClick={() => handleEditLog(log)}
              >
                编辑
              </button>
              <button
                className="delete-button"
                onClick={() => handleDeleteLog(log.id)}
              >
                {confirmDeleteId === log.id ? '确认删除' : '删除'}
              </button>
            </div>
          ))}
          {modalImage && (
            <div className="modal" onClick={handleCloseModal}>
              <div className="modal-content">
                <img src={modalImage} alt="Full Size" />
              </div>
            </div>
          )}
        </div>
      );
    }

    export default Tracker;
