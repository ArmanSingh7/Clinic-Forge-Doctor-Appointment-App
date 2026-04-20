package com.doctorapp.repository;

import com.doctorapp.entity.User;

public interface IUserRepository {

    User validateUser(User user);

    User addUser(User user);

    User removeUser(User user);

    User updateUser(User user);
}
