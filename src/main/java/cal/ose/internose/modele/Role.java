package cal.ose.internose.modele;

public enum Role{
	EMPLOYER("ROLE_EMPLOYER");

	private final String string;

	Role(String string){
		this.string = string;
	}

	@Override
	public String toString(){
		return string;
	}

}
