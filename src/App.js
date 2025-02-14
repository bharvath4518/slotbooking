import React, { useState, useEffect } from "react";
import axios from "axios";
import io from "socket.io-client";
import { Container, Grid, Typography, TextField, Button, MenuItem, Select, InputLabel, FormControl, Paper, List, ListItem, ListItemText, IconButton } from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';

const socket = io("http://localhost:5000");

function App() {
  const [bookings, setBookings] = useState([]);
  const [formData, setFormData] = useState({
    room_name: "Akasha",
    user_name: "",
    purpose: "",
    booking_date: "",
    start_time: "",
    end_time: "",
  });

  useEffect(() => {
    fetchBookings();
    socket.on("new_booking", (newBooking) => {
      // Check if the new booking is already in the list
      setBookings((prevBookings) => {
        // Avoid duplicate entries by checking if the booking already exists in the state
        const isBookingExist = prevBookings.some((booking) => booking.id === newBooking.id);
        if (!isBookingExist) {
          return [...prevBookings, newBooking];
        }
        return prevBookings;
      });
    });
    socket.on("cancel_booking", (id) => {
      setBookings((prev) => prev.filter((b) => b.id !== id));
    });
  }, []);

  const fetchBookings = async () => {
    const res = await axios.get("http://localhost:5000/slots");
    setBookings(res.data);
  };

  const bookSlot = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/book", formData);
      // Re-fetch bookings after a successful booking to keep the list fresh
      fetchBookings();
      setFormData({
        room_name: "Akasha",
        user_name: "",
        purpose: "",
        booking_date: "",
        start_time: "",
        end_time: "",
      });
    } catch (error) {
      alert(error.response?.data?.error || "Error booking slot");
    }
  };

  const cancelBooking = async (id) => {
    try {
      await axios.post("http://localhost:5000/cancel", { id });
    } catch (error) {
      alert(error.response?.data?.error || "Error canceling booking");
    }
  };

  return (
    <Container maxWidth="lg" sx={{ paddingTop: 4 }}>
      <Grid container spacing={3}>
        {/* Booking Form */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ padding: 3 }}>
            <Typography variant="h5" gutterBottom>Book a Room</Typography>
            <form onSubmit={bookSlot}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Room</InputLabel>
                <Select
                  value={formData.room_name}
                  onChange={(e) => setFormData({ ...formData, room_name: e.target.value })}
                  label="Room"
                >
                  <MenuItem value="Akasha">Akasha</MenuItem>
                  <MenuItem value="Vayu">Vayu</MenuItem>
                  <MenuItem value="Agni">Agni</MenuItem>
                  <MenuItem value="Main Conference Hall">Main Conference Hall</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Your Name"
                value={formData.user_name}
                onChange={(e) => setFormData({ ...formData, user_name: e.target.value })}
                margin="normal"
              />

              <TextField
                fullWidth
                label="Purpose"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                margin="normal"
              />

              <TextField
                fullWidth
                type="date"
                value={formData.booking_date}
                onChange={(e) => setFormData({ ...formData, booking_date: e.target.value })}
                margin="normal"
              />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    margin="normal"
                  />
                </Grid>
              </Grid>

              <Button fullWidth variant="contained" color="primary" type="submit" sx={{ marginTop: 2 }}>
                Book
              </Button>
            </form>
          </Paper>
        </Grid>

        {/* Booked Slots List */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ padding: 3 }}>
            <Typography variant="h5" gutterBottom>Booked Slots</Typography>
            <List>
              {bookings.map((b) => (
                <ListItem
                  key={b.id}
                  sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <ListItemText
                    primary={`${b.room_name} - ${b.booking_date} ${b.start_time} - ${b.end_time}`}
                    secondary={`${b.user_name} (${b.purpose})`}
                  />
                  <IconButton color="secondary" onClick={() => cancelBooking(b.id)}>
                    <CancelIcon />
                  </IconButton>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default App;
