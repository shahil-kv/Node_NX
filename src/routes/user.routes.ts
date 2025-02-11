import { Router } from 'express';
import passport from 'passport';
import { UserRolesEnum } from '../constant';
import {
  assignRole,
  changeCurrentPassword,
  forgotPasswordRequest,
  getCurrentUser,
  handleSocialLogin,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  resendEmailVerification,
  resetForgottenPassword,
  updateUserAvatar,
  verifyEmail,
} from '../controllers/user.controller';
import { verifyJWT, verifyPermission } from '../middleware/auth.middleware';
import {
  userAssignRoleValidator,
  userChangeCurrentPasswordValidator,
  userForgotPasswordValidator,
  userLoginValidator,
  userRegisterValidator,
  userResetForgottenPasswordValidator,
} from '../validators/auth/user.validate';
import { validate } from '../validators/validate';

const router = Router();

// Unsecured route
router.route('/register').post(userRegisterValidator(), validate, registerUser);
router.route('/login').post(userLoginValidator(), validate, loginUser);
router.route('/refresh-token').post(refreshAccessToken);
router.route('/verify-email/:verificationToken').get(verifyEmail);

router.route('/forgot-password').post(userForgotPasswordValidator(), validate, forgotPasswordRequest);
router.route('/reset-password/:resetToken').post(userResetForgottenPasswordValidator(), validate, resetForgottenPassword);

// Secured routes
router.route('/logout').post(verifyJWT, logoutUser);
router.route('/avatar').post(verifyJWT, updateUserAvatar);
router.route('/current-user').get(verifyJWT, getCurrentUser);
router.route('/change-password').post(verifyJWT, userChangeCurrentPasswordValidator(), validate, changeCurrentPassword);
router.route('/resend-email-verification').post(verifyJWT, resendEmailVerification);
router.route('/assign-role/:userId').post(verifyJWT, verifyPermission([UserRolesEnum.ADMIN]), userAssignRoleValidator(), validate, assignRole);

// SSO routes
router.route('/google').get(
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  }),
  (req, res) => {
    res.send('redirecting to google...');
  }
);

router.route('/github').get(
  passport.authenticate('github', {
    scope: ['profile', 'email'],
  }),
  (req, res) => {
    res.send('redirecting to github...');
  }
);

router.route('/google/callback').get(passport.authenticate('google'), handleSocialLogin);

router.route('/github/callback').get(passport.authenticate('github'), handleSocialLogin);

export default router;
