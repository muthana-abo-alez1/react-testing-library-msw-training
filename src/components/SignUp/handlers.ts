import { http, HttpResponse } from "msw";
import { User } from "../../APIs";

const mockUser: User = {
  username: "mockUser",
  bio: "This is a mock bio",
  image: "https://example.com/avatar.jpg",
  email: "mockuser@example.com",
  token: "mocked-token-123",
};

const baseUrl=(value:string)=>{
  return "https://api.realworld.io/api" + value;

}
export const handlers = (status: number) => [
  http.post(baseUrl("/users"), () => 
    HttpResponse.json(
      status === 200 
        ? { user: mockUser } 
        : { error: "Invalid request" }, 
      { status }
    )
  ),
];