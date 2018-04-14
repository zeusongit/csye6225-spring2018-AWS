package com.csye6225.spring2018.controller;
import javax.validation.Valid;

import com.csye6225.spring2018.models.User;
import com.csye6225.spring2018.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

@Controller
public class IndexController {

  @Autowired
  UserRepository userRepository;
  private final static Logger logger = LoggerFactory.getLogger(IndexController.class);

  @RequestMapping(value="/",method= RequestMethod.GET)
  public String index(User user) {
    logger.info("Loading home page.");
    return "index";
  }
    @RequestMapping(value="/post",method= RequestMethod.POST)
  public String index(@Valid User user, BindingResult bindingResult, Model model) {
    if(bindingResult.hasErrors()){
        return "index";
    }
    model.addAttribute("username",user.getUsername());
    model.addAttribute("password",user.getPassword());


      User note = userRepository.findByUsername(user.getUsername());
      if(note == null) {
        model.addAttribute("status","NULL");
      }
      else{
        model.addAttribute("status","OK");
      }



    return "Dashboard";
  }

}
